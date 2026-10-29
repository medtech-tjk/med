from fastapi import APIRouter, Depends, HTTPException, Request, Response
from database import db
from middleware import verify_admin_token, create_admin_session, COOKIE_NAME, session_hash
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/admin", tags=["Admin"])

class SessionCredentials(BaseModel):
    token: str = Field(min_length=1,max_length=1024)

@router.post('/session')
async def login(credentials:SessionCredentials,request:Request,response:Response):
    return await create_admin_session(request,response,credentials.token)

@router.get('/session',dependencies=[Depends(verify_admin_token)])
async def get_session(request:Request,response:Response):
    record=request.state.admin_session
    response.headers['Cache-Control']='no-store'
    return {'valid':True,'csrf_token':record['csrf_token'],'expires_at':record['expires_at'].isoformat()}

@router.delete('/session',dependencies=[Depends(verify_admin_token)])
async def logout(request:Request,response:Response):
    # Use the authenticated store from middleware, also allowing test isolation.
    import middleware
    await middleware.db.admin_sessions.delete_one({'_id':session_hash(request.cookies[COOKIE_NAME])})
    response.delete_cookie(COOKIE_NAME,path='/',httponly=True,samesite='strict')
    response.headers['Cache-Control']='no-store'
    return {'message':'Signed out'}

# MongoDB connection

@router.post("/verify")
async def verify_token(request: Request):
    """Verify admin token"""
    await verify_admin_token(request)
    
    return {"message": "Token verified", "valid": True}

@router.get("/stats", dependencies=[Depends(verify_admin_token)])
async def get_stats():
    """Get admin dashboard statistics"""
    products_count = await db.products.count_documents({})
    categories_count = await db.categories.count_documents({})
    orders_count = await db.orders.count_documents({})
    new_orders_count = await db.orders.count_documents({"status": "new"})
    
    return {
        "products": products_count,
        "categories": categories_count,
        "orders": orders_count,
        "newOrders": new_orders_count
    }
