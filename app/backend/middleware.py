"""Opaque, expiring administrator sessions backed by the shared database."""
import hashlib
import os
import re
import secrets
from datetime import datetime,timezone,timedelta
from fastapi import Request,HTTPException,Response
from database import db

COOKIE_NAME='medtech_admin_session'
SAFE_METHODS={'GET','HEAD','OPTIONS'}

def is_production():
    platform_environment=bool(os.environ.get('RAILWAY_ENVIRONMENT_ID') or os.environ.get('RAILWAY_ENVIRONMENT_NAME') or os.environ.get('RAILWAY_ENVIRONMENT'))
    mode=os.environ.get('APP_ENV') or os.environ.get('ENVIRONMENT')
    return platform_environment or (mode or '').strip().lower() in {'production','prod','staging'}

def load_admin_token():
    # No fallback to the old plaintext file. This is a login secret, never an API bearer token.
    value=os.environ.get('ADMIN_TOKEN','').strip()
    return value if len(value)>=32 else None

def allowed_origins():
    default='https://medtech.tj,https://www.medtech.tj,http://localhost:3000,http://localhost:3100,http://localhost:5173'
    return {value.strip().rstrip('/') for value in os.environ.get('CORS_ORIGINS',default).split(',') if value.strip()}

def check_origin(request):
    origin=request.headers.get('origin')
    if request.headers.get('sec-fetch-site')=='cross-site' or (origin and origin.rstrip('/') not in allowed_origins()):
        raise HTTPException(403,'Request origin is not allowed')

def session_hash(value):return hashlib.sha256(value.encode()).hexdigest()

async def create_admin_session(request:Request,response:Response,master:str):
    check_origin(request)
    expected=load_admin_token()
    if not expected:raise HTTPException(503,'Administrator login is not configured')
    if not secrets.compare_digest(master.encode(),expected.encode()):raise HTTPException(401,'Invalid credentials')
    ttl=max(60,min(int(os.environ.get('SESSION_TTL_SECONDS','1800')),28800))
    value=secrets.token_urlsafe(32)
    csrf=secrets.token_urlsafe(32)
    expires=datetime.now(timezone.utc)+timedelta(seconds=ttl)
    await db.admin_sessions.insert_one({'_id':session_hash(value),'csrf_token':csrf,'key_fingerprint':session_hash(expected),'expires_at':expires})
    response.set_cookie(COOKIE_NAME,value,max_age=ttl,httponly=True,secure=is_production(),samesite='strict',path='/')
    response.headers['Cache-Control']='no-store'
    return {'valid':True,'csrf_token':csrf,'expires_at':expires.isoformat()}

async def verify_admin_token(request:Request):
    value=request.cookies.get(COOKIE_NAME,'')
    expected=load_admin_token()
    if not expected or not re.fullmatch(r'[A-Za-z0-9_-]{43}',value):raise HTTPException(401,'Session required')
    record=await db.admin_sessions.find_one({'_id':session_hash(value)})
    now=datetime.now(timezone.utc)
    expires=record.get('expires_at') if record else None
    if expires and expires.tzinfo is None:expires=expires.replace(tzinfo=timezone.utc)
    if not record or not expires or expires<=now or not secrets.compare_digest(record.get('key_fingerprint',''),session_hash(expected)):
        raise HTTPException(401,'Session expired')
    if request.method not in SAFE_METHODS:
        check_origin(request)
        csrf=request.headers.get('X-CSRF-Token','')
        if not csrf or not secrets.compare_digest(csrf,record.get('csrf_token','')):raise HTTPException(403,'Invalid CSRF token')
    request.state.admin_session=record
    return True
