from fastapi import APIRouter, Depends, HTTPException
from models import Category, Subcategory, ThirdLevelCategory
from motor.motor_asyncio import AsyncIOMotorClient
from middleware import verify_admin_token
import os
from typing import List, Optional
from datetime import datetime
import uuid
from dotenv import load_dotenv
from pathlib import Path
from pydantic import BaseModel

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

router = APIRouter(prefix="/api/categories", tags=["Categories"], redirect_slashes=False)

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# Update models - only fields that can be updated
class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    name_en: Optional[str] = None
    slug: Optional[str] = None
    image: Optional[str] = None
    description: Optional[str] = None
    description_en: Optional[str] = None
    order: Optional[int] = None

class SubcategoryUpdate(BaseModel):
    name: Optional[str] = None
    name_en: Optional[str] = None
    slug: Optional[str] = None
    image: Optional[str] = None
    description: Optional[str] = None
    description_en: Optional[str] = None
    order: Optional[int] = None
    parent_id: Optional[str] = None

class ThirdLevelUpdate(BaseModel):
    name: Optional[str] = None
    name_en: Optional[str] = None
    slug: Optional[str] = None
    image: Optional[str] = None
    description: Optional[str] = None
    description_en: Optional[str] = None
    order: Optional[int] = None
    parent_id: Optional[str] = None

@router.get("/")
async def get_categories():
    """Get all categories with their subcategories and third level"""
    categories = await db.categories.find({}, {"_id": 0}).sort("order", 1).to_list(1000)
    
    # Get subcategories for each category
    for category in categories:
        subcategories = await db.subcategories.find(
            {"parent_id": category['id']}, {"_id": 0}
        ).sort("order", 1).to_list(1000)
        
        # Get third level categories for each subcategory
        for subcategory in subcategories:
            children = await db.third_level_categories.find(
                {"parent_id": subcategory['id']}, {"_id": 0}
            ).sort("order", 1).to_list(1000)
            subcategory['children'] = children
        
        category['subcategories'] = subcategories
        # Also add as 'children' for frontend compatibility
        category['children'] = subcategories
    
    return categories

@router.get("/{category_id}")
async def get_category(category_id: str):
    """Get a single category by ID"""
    category = await db.categories.find_one({"id": category_id}, {"_id": 0})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Get subcategories
    subcategories = await db.subcategories.find(
        {"parent_id": category['id']}, {"_id": 0}
    ).sort("order", 1).to_list(1000)
    
    # Get third level for each subcategory
    for subcategory in subcategories:
        children = await db.third_level_categories.find(
            {"parent_id": subcategory['id']}, {"_id": 0}
        ).sort("order", 1).to_list(1000)
        subcategory['children'] = children
    
    category['subcategories'] = subcategories
    category['children'] = subcategories
    
    return category

@router.post("/", dependencies=[Depends(verify_admin_token)])
async def create_category(category: Category):
    """Create a new category (Admin only)"""
    category_dict = category.dict()
    category_dict['created_at'] = datetime.now(datetime.timezone.utc)
    category_dict['updated_at'] = datetime.now(datetime.timezone.utc)
    
    result = await db.categories.insert_one(category_dict)
    return {"id": category.id, "message": "Category created successfully"}

@router.put("/{category_id}", dependencies=[Depends(verify_admin_token)])
async def update_category(category_id: str, category: CategoryUpdate):
    """Update a category (Admin only) - only updates provided fields"""
    # Get only non-None fields to update
    update_data = {k: v for k, v in category.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data['updated_at'] = datetime.now(datetime.timezone.utc)
    
    result = await db.categories.update_one(
        {"id": category_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {"message": "Category updated successfully"}

@router.delete("/{category_id}", dependencies=[Depends(verify_admin_token)])
async def delete_category(category_id: str):
    """Delete a category and all subcategories (Admin only)"""
    # Get subcategories to delete their children
    subcategories = await db.subcategories.find({"parent_id": category_id}).to_list(1000)
    for sub in subcategories:
        await db.third_level_categories.delete_many({"parent_id": sub.get('id')})
    
    await db.subcategories.delete_many({"parent_id": category_id})
    result = await db.categories.delete_one({"id": category_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {"message": "Category deleted successfully"}


@router.put("/{category_id}/reorder", dependencies=[Depends(verify_admin_token)])
async def reorder_category(category_id: str, new_order: int):
    """Изменить порядок категории и сдвинуть остальные"""
    # Получаем текущую категорию
    category = await db.categories.find_one({"id": category_id})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    old_order = category.get('order', 0)
    
    if old_order == new_order:
        return {"message": "Order unchanged"}
    
    # Получаем все категории
    all_categories = await db.categories.find({}).sort("order", 1).to_list(1000)
    
    # Перестраиваем порядок
    if old_order < new_order:
        # Двигаем вниз: все категории между old и new сдвигаются на -1
        for cat in all_categories:
            cat_order = cat.get('order', 0)
            if cat['id'] == category_id:
                await db.categories.update_one({"id": cat['id']}, {"$set": {"order": new_order}})
            elif old_order < cat_order <= new_order:
                await db.categories.update_one({"id": cat['id']}, {"$set": {"order": cat_order - 1}})
    else:
        # Двигаем вверх: все категории между new и old сдвигаются на +1
        for cat in all_categories:
            cat_order = cat.get('order', 0)
            if cat['id'] == category_id:
                await db.categories.update_one({"id": cat['id']}, {"$set": {"order": new_order}})
            elif new_order <= cat_order < old_order:
                await db.categories.update_one({"id": cat['id']}, {"$set": {"order": cat_order + 1}})
    
    return {"message": "Category reordered successfully"}


@router.post("/reorder-all", dependencies=[Depends(verify_admin_token)])
async def reorder_all_categories(category_ids: List[str]):
    """Переупорядочить все категории по переданному списку ID"""
    for index, cat_id in enumerate(category_ids):
        await db.categories.update_one(
            {"id": cat_id},
            {"$set": {"order": index}}
        )
    return {"message": "All categories reordered successfully"}

# Subcategory routes
@router.post("/{category_id}/subcategories", dependencies=[Depends(verify_admin_token)])
async def create_subcategory(category_id: str, subcategory: Subcategory):
    """Create a new subcategory (Admin only)"""
    subcategory_dict = subcategory.dict()
    subcategory_dict['parent_id'] = category_id
    subcategory_dict['created_at'] = datetime.now(datetime.timezone.utc)
    subcategory_dict['updated_at'] = datetime.now(datetime.timezone.utc)
    
    result = await db.subcategories.insert_one(subcategory_dict)
    return {"id": subcategory.id, "message": "Subcategory created successfully"}

@router.put("/subcategories/{subcategory_id}", dependencies=[Depends(verify_admin_token)])
async def update_subcategory(subcategory_id: str, subcategory: SubcategoryUpdate):
    """Update a subcategory (Admin only) - only updates provided fields"""
    update_data = {k: v for k, v in subcategory.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data['updated_at'] = datetime.now(datetime.timezone.utc)
    
    result = await db.subcategories.update_one(
        {"id": subcategory_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Subcategory not found")
    
    return {"message": "Subcategory updated successfully"}

@router.delete("/subcategories/{subcategory_id}", dependencies=[Depends(verify_admin_token)])
async def delete_subcategory(subcategory_id: str):
    """Delete a subcategory (Admin only)"""
    # Delete all third level categories
    await db.third_level_categories.delete_many({"parent_id": subcategory_id})
    
    result = await db.subcategories.delete_one({"id": subcategory_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Subcategory not found")
    
    return {"message": "Subcategory deleted successfully"}


@router.post("/subcategories/reorder-all", dependencies=[Depends(verify_admin_token)])
async def reorder_all_subcategories(parent_id: str, subcategory_ids: List[str]):
    """Переупорядочить все подкатегории в рамках родительской категории"""
    for index, sub_id in enumerate(subcategory_ids):
        await db.subcategories.update_one(
            {"id": sub_id, "parent_id": parent_id},
            {"$set": {"order": index}}
        )
    return {"message": "Subcategories reordered successfully"}


@router.post("/third-level/reorder-all", dependencies=[Depends(verify_admin_token)])
async def reorder_all_third_level(parent_id: str, item_ids: List[str]):
    """Переупорядочить все категории 3-го уровня"""
    for index, item_id in enumerate(item_ids):
        await db.third_level_categories.update_one(
            {"id": item_id, "parent_id": parent_id},
            {"$set": {"order": index}}
        )
    return {"message": "Third level categories reordered successfully"}

# Third level categories routes
@router.post("/subcategories/{subcategory_id}/children", dependencies=[Depends(verify_admin_token)])
async def create_third_level(subcategory_id: str, category: ThirdLevelCategory):
    """Create a new third level category (Admin only)"""
    category_dict = category.dict()
    category_dict['parent_id'] = subcategory_id
    category_dict['created_at'] = datetime.now(datetime.timezone.utc)
    category_dict['updated_at'] = datetime.now(datetime.timezone.utc)
    
    result = await db.third_level_categories.insert_one(category_dict)
    return {"id": category.id, "message": "Third level category created successfully"}

@router.put("/third-level/{category_id}", dependencies=[Depends(verify_admin_token)])
async def update_third_level(category_id: str, category: ThirdLevelUpdate):
    """Update a third level category (Admin only) - only updates provided fields"""
    update_data = {k: v for k, v in category.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data['updated_at'] = datetime.now(datetime.timezone.utc)
    
    result = await db.third_level_categories.update_one(
        {"id": category_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Third level category not found")
    
    return {"message": "Third level category updated successfully"}

@router.delete("/third-level/{category_id}", dependencies=[Depends(verify_admin_token)])
async def delete_third_level(category_id: str):
    """Delete a third level category (Admin only)"""
    result = await db.third_level_categories.delete_one({"id": category_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Third level category not found")
    
    return {"message": "Third level category deleted successfully"}

# Import filters from separate file
import sys
sys.path.insert(0, str(ROOT_DIR))
from category_filters import get_specs_for_category
from category_filters_en import get_specs_for_category as get_specs_for_category_en

@router.get("/specs/{subcategory_slug}")
async def get_category_specs(subcategory_slug: str, lang: str = 'ru'):
    """Get specifications (characteristics) for a subcategory by slug
    
    Args:
        subcategory_slug: Slug of the subcategory
        lang: Language code ('ru' or 'en'), defaults to 'ru'
    """
    if lang == 'en':
        specs = get_specs_for_category_en(subcategory_slug)
    else:
        specs = get_specs_for_category(subcategory_slug)
    
    return {"slug": subcategory_slug, "specs": specs, "lang": lang}
