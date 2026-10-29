from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from database import db, client
from middleware import verify_admin_token
import os
from typing import List, Optional
from datetime import datetime, timezone
import uuid
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

router = APIRouter(prefix="/api/slides", tags=["Slides"])

# MongoDB connection

class Slide(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    title_en: Optional[str] = None  # Заголовок на английском
    subtitle: Optional[str] = None
    subtitle_en: Optional[str] = None  # Подзаголовок на английском
    image: str  # Универсальное поле для изображения (используется новой админкой)
    image_desktop: Optional[str] = None  # Картинка для ПК (1920x600) - для совместимости
    image_mobile: Optional[str] = None  # Картинка для мобильных (768x400)
    image_tablet: Optional[str] = None  # Картинка для планшетов (1024x500)
    cta_text: Optional[str] = 'Подробнее'
    cta_text_en: Optional[str] = None  # Текст кнопки на английском
    cta_link: Optional[str] = '/catalog'
    order: int = 0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

@router.get("/", response_model=List[Slide])
async def get_slides():
    """Get all active slides"""
    slides = await db.slides.find({"is_active": True}, {"_id": 0}).sort("order", 1).to_list(100)
    return slides

@router.get("/all", response_model=List[Slide], dependencies=[Depends(verify_admin_token)])
async def get_all_slides():
    """Get all slides including inactive (Admin)"""
    slides = await db.slides.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return slides

@router.post("/", dependencies=[Depends(verify_admin_token)])
async def create_slide(slide: Slide):
    """Create a new slide (Admin only)"""
    slide_dict = slide.dict()
    slide_dict['created_at'] = datetime.now(timezone.utc)
    slide_dict['updated_at'] = datetime.now(timezone.utc)
    
    # Синхронизируем image и image_desktop для совместимости
    if 'image' in slide_dict and slide_dict['image']:
        if not slide_dict.get('image_desktop'):
            slide_dict['image_desktop'] = slide_dict['image']
    elif 'image_desktop' in slide_dict and slide_dict['image_desktop']:
        if not slide_dict.get('image'):
            slide_dict['image'] = slide_dict['image_desktop']
    
    await db.slides.insert_one(slide_dict)
    return {"id": slide.id, "message": "Slide created successfully"}

@router.put("/{slide_id}", dependencies=[Depends(verify_admin_token)])
async def update_slide(slide_id: str, slide: Slide):
    """Update a slide (Admin only)"""
    slide_dict = slide.dict()
    slide_dict['id'] = slide_id
    slide_dict.pop('created_at', None)
    slide_dict['updated_at'] = datetime.now(timezone.utc)
    
    result = await db.slides.update_one(
        {"id": slide_id},
        {"$set": slide_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Slide not found")
    
    return {"message": "Slide updated successfully"}

@router.delete("/{slide_id}", dependencies=[Depends(verify_admin_token)])
async def delete_slide(slide_id: str):
    """Delete a slide (Admin only)"""
    result = await db.slides.delete_one({"id": slide_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Slide not found")
    
    return {"message": "Slide deleted successfully"}
