from fastapi import APIRouter, Depends, HTTPException
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')
from models import FeaturedProduct
from motor.motor_asyncio import AsyncIOMotorClient
from middleware import verify_admin_token
import os
from typing import List
from datetime import datetime

router = APIRouter(prefix="/api/featured", tags=["Featured Products"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

@router.get("/")
async def get_featured_products():
    """Get all featured products with full product data"""
    featured = await db.featured_products.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    
    # Get full product data for each featured product
    result = []
    for item in featured:
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            result.append(product)
    
    return result

@router.post("/", dependencies=[Depends(verify_admin_token)])
async def add_featured_product(featured: FeaturedProduct):
    """Add a product to featured list (Admin only)"""
    # Check if product exists
    product = await db.products.find_one({"id": featured.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if already featured
    existing = await db.featured_products.find_one({"product_id": featured.product_id})
    if existing:
        raise HTTPException(status_code=400, detail="Product is already featured")
    
    featured_dict = featured.dict()
    featured_dict['created_at'] = datetime.now(datetime.UTC)
    
    result = await db.featured_products.insert_one(featured_dict)
    return {"id": featured.id, "message": "Product added to featured list"}

@router.delete("/{product_id}", dependencies=[Depends(verify_admin_token)])
async def remove_featured_product(product_id: str):
    """Remove a product from featured list (Admin only)"""
    # Try to delete by product_id first (frontend sends product.id)
    result = await db.featured_products.delete_one({"product_id": product_id})
    
    if result.deleted_count == 0:
        # Fallback: try to delete by featured id
        result = await db.featured_products.delete_one({"id": product_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Featured product not found")
    
    return {"message": "Product removed from featured list"}

@router.put("/{featured_id}/order", dependencies=[Depends(verify_admin_token)])
async def update_featured_order(featured_id: str, order: int):
    """Update the order of a featured product (Admin only)"""
    result = await db.featured_products.update_one(
        {"id": featured_id},
        {"$set": {"order": order}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Featured product not found")
    
    return {"message": "Featured product order updated"}
