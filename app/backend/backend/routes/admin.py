from fastapi import APIRouter, Depends, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorClient
from middleware import verify_admin_token, load_admin_token
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

router = APIRouter(prefix="/api/admin", tags=["Admin"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

@router.post("/verify")
async def verify_token(request: Request):
    """Verify admin token"""
    token = request.headers.get('X-Admin-Token')
    valid_token = load_admin_token()
    
    if not token or token != valid_token:
        raise HTTPException(status_code=401, detail="Invalid token")
    
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
