from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import os
import logging
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')
uploads_dir = ROOT_DIR / 'uploads'
for directory in (uploads_dir, uploads_dir / 'documents', uploads_dir / 'logos'):
    directory.mkdir(parents=True, exist_ok=True)

from database import client, db, ensure_indexes
from rate_limit import configured_limiter, AbuseProtectionMiddleware, SecurityHeadersMiddleware
from middleware import is_production, load_admin_token
from routes import categories, products, orders, featured, upload, news, slides, admin, settings, seo, prerender

limiter = configured_limiter()


@asynccontextmanager
async def lifespan(app):
    if is_production():
        if not os.environ.get('MONGO_URL') or not os.environ.get('DB_NAME'):
            raise RuntimeError('MONGO_URL and DB_NAME are required in production')
        if not load_admin_token():
            raise RuntimeError('ADMIN_TOKEN with at least 32 characters is required in production')
        if os.environ.get('FRONTEND_PROXY', '').lower() == 'true' and len(os.environ.get('PROXY_SHARED_SECRET', '')) < 32:
            raise RuntimeError('FRONTEND_PROXY requires a shared PROXY_SHARED_SECRET of at least 32 characters')
        try:
            ttl=int(os.environ.get('SESSION_TTL_SECONDS','1800'))
            if not 60 <= ttl <= 28800: raise ValueError()
        except ValueError:
            raise RuntimeError('SESSION_TTL_SECONDS must be between 60 and 28800')
    try:
        if hasattr(limiter, 'redis'):
            await limiter.redis.ping()
        await ensure_indexes()
        yield
    finally:
        await limiter.close()
        await client.close()


app = FastAPI(title='Tib Tekhnologiya API', lifespan=lifespan)
api_router = APIRouter(prefix='/api')


@api_router.get('/')
async def root():
    return {'message': 'Tib Tekhnologiya API'}


@api_router.get('/health')
async def health_check():
    try:
        await asyncio.wait_for(client.admin.command('ping'), timeout=2)
        if hasattr(limiter, 'redis'):
            await asyncio.wait_for(limiter.redis.ping(), timeout=2)
        return {'status': 'healthy'}
    except Exception:
        return JSONResponse({'status': 'unavailable'}, status_code=503)


for route in (categories, products, orders, featured, upload, news, slides, admin, settings, seo, prerender):
    app.include_router(route.router)
app.include_router(api_router)
app.mount('/uploads', StaticFiles(directory=str(uploads_dir)), name='uploads')
app.add_middleware(AbuseProtectionMiddleware, limiter=limiter)
app.add_middleware(CORSMiddleware, allow_credentials=False, allow_origins=[origin.strip() for origin in os.environ.get('CORS_ORIGINS', 'https://medtech.tj,https://www.medtech.tj,http://localhost:3000,http://localhost:3100').split(',') if origin.strip()], allow_methods=['*'], allow_headers=['*'])
app.add_middleware(SecurityHeadersMiddleware)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
