from fastapi import APIRouter, Depends, HTTPException
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
from middleware import verify_admin_token
import os
from typing import List, Optional
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/news", tags=["News"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

class NewsSlide(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    subtitle: Optional[str] = None
    image: str
    cta_text: Optional[str] = None
    cta_link: Optional[str] = None
    order: int = 0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

@router.get("/", response_model=List[NewsSlide])
async def get_news_slides(active_only: bool = True):
    """Get all news slides"""
    query = {"is_active": True} if active_only else {}
    slides = await db.news_slides.find(query).sort("order", 1).to_list(100)
    return slides

@router.get("/{slide_id}", response_model=NewsSlide)
async def get_news_slide(slide_id: str):
    """Get a single news slide by ID"""
    slide = await db.news_slides.find_one({"id": slide_id})
    if not slide:
        raise HTTPException(status_code=404, detail="News slide not found")
    return slide

@router.post("/", dependencies=[Depends(verify_admin_token)])
async def create_news_slide(slide: NewsSlide):
    """Create a new news slide (Admin only)"""
    slide_dict = slide.dict()
    slide_dict['created_at'] = datetime.now(datetime.UTC)
    slide_dict['updated_at'] = datetime.now(datetime.UTC)
    
    result = await db.news_slides.insert_one(slide_dict)
    return {"id": slide.id, "message": "News slide created successfully"}

@router.put("/{slide_id}", dependencies=[Depends(verify_admin_token)])
async def update_news_slide(slide_id: str, slide: NewsSlide):
    """Update a news slide (Admin only)"""
    slide_dict = slide.dict()
    slide_dict['updated_at'] = datetime.now(datetime.UTC)
    
    result = await db.news_slides.update_one(
        {"id": slide_id},
        {"$set": slide_dict}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="News slide not found")
    
    return {"message": "News slide updated successfully"}

@router.delete("/{slide_id}", dependencies=[Depends(verify_admin_token)])
async def delete_news_slide(slide_id: str):
    """Delete a news slide (Admin only)"""
    result = await db.news_slides.delete_one({"id": slide_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="News slide not found")
    
    return {"message": "News slide deleted successfully"}

@router.put("/{slide_id}/order", dependencies=[Depends(verify_admin_token)])
async def update_slide_order(slide_id: str, order: int):
    """Update the order of a news slide (Admin only)"""
    result = await db.news_slides.update_one(
        {"id": slide_id},
        {"$set": {"order": order, "updated_at": datetime.now(datetime.UTC)}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="News slide not found")
    
    return {"message": "Slide order updated"}
