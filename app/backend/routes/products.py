from fastapi import APIRouter, Depends, HTTPException, Query
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')
from models import Product
from motor.motor_asyncio import AsyncIOMotorClient
from middleware import verify_admin_token
import os
from typing import List, Optional
from datetime import datetime
from rapidfuzz import fuzz, process

router = APIRouter(prefix="/api/products", tags=["Products"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# Translation dictionaries for auto-translating specs
SPEC_KEY_TRANSLATIONS = {
    'Бренд': 'Brand', 'Страна': 'Country', 'Привод': 'Drive', 'Тип аппарата': 'Device Type',
    'Пациенты': 'Patients', 'Способ вентиляции': 'Ventilation Method', 'Тип': 'Type', 'Класс': 'Class',
    'Область применения': 'Application Area', 'Количество разъемов для датчиков': 'Number of Probe Connectors',
    'Тип датчика': 'Probe Type', 'Тип конструкции': 'Construction Type', 'Назначение': 'Purpose',
    'Рентгенопрозрачность': 'Radiolucent', 'Максимальная нагрузка (кг)': 'Max Load (kg)',
    'Тип привода': 'Drive Type', 'Количество приводов': 'Number of Drives', 'Метод регулировки': 'Adjustment Method',
    'Регулировка спинки': 'Backrest Adjustment', 'Регулировка подголовника': 'Headrest Adjustment',
    'Исполнение': 'Design', 'Привод': 'Drive',
}

SPEC_VALUE_TRANSLATIONS = {
    'Стационарный': 'Stationary', 'Стационарное': 'Stationary', 'Портативный': 'Portable', 'Мобильный': 'Mobile',
    'Экспертный': 'Expert', 'Премиум': 'Premium', 'Высокий': 'High', 'Средний': 'Mid-range',
    'Общая визуализация': 'General Imaging', 'Кардиология': 'Cardiology', 'Ангиология': 'Angiology',
    'КНР': 'China', 'Южная Корея': 'South Korea', 'Германия': 'Germany', 'Германи': 'Germany',
    'Япония': 'Japan', 'Турбинный': 'Turbine', 'Взрослые': 'Adults', 'Дети': 'Children',
    'Комбинированный': 'Combined', 'Да': 'Yes', 'Нет': 'No', 'Общая хирургия': 'General Surgery',
    'Терапевтическое': 'Therapeutic', 'Хирургическое': 'Surgical', 'Электрический': 'Electric',
    'Ножная педаль': 'Foot Pedal', 'Гидравлический': 'Hydraulic', 'Газлифт': 'Gas Lift',
    'Газ-лифт': 'Gas Lift',
}

def auto_translate_specs(specs_ru: dict) -> dict:
    """Автоматически переводит specs с русского на английский"""
    if not specs_ru:
        return {}
    specs_en = {}
    for key_ru, value_ru in specs_ru.items():
        key_en = SPEC_KEY_TRANSLATIONS.get(key_ru, key_ru)
        value_en = SPEC_VALUE_TRANSLATIONS.get(value_ru, value_ru)
        specs_en[key_en] = value_en
    return specs_en


def fuzzy_search_products(products: list, search_query: str, threshold: int = 50) -> list:
    """
    Выполняет нечеткий поиск (fuzzy search) по списку товаров.
    Использует rapidfuzz для нахождения товаров даже при опечатках.
    """
    if not search_query or not products:
        return products
    
    search_lower = search_query.lower()
    scored_products = []
    
    for product in products:
        # Комбинируем поля для поиска
        name = (product.get('name') or '').lower()
        brand = (product.get('brand') or '').lower()
        description = (product.get('description') or '').lower()[:200]  # Ограничим описание
        sku = (product.get('sku') or '').lower()
        
        # Вычисляем оценки сходства
        name_score = fuzz.partial_ratio(search_lower, name)
        brand_score = fuzz.partial_ratio(search_lower, brand)
        desc_score = fuzz.partial_ratio(search_lower, description) * 0.5  # Меньший вес для описания
        sku_score = fuzz.ratio(search_lower, sku)
        
        # Также проверяем точное вхождение (для быстрого поиска)
        exact_match = search_lower in name or search_lower in brand or search_lower in sku
        
        # Максимальная оценка
        max_score = max(name_score, brand_score, desc_score, sku_score)
        
        # Бонус за точное вхождение
        if exact_match:
            max_score = max(max_score, 95)
        
        if max_score >= threshold:
            scored_products.append((product, max_score))
    
    # Сортируем по оценке (от высшей к низшей)
    scored_products.sort(key=lambda x: x[1], reverse=True)
    
    return [p[0] for p in scored_products]

@router.get("/", response_model=List[Product])
async def get_products(
    category_id: Optional[str] = None,
    subcategory_id: Optional[str] = None,
    third_level_id: Optional[str] = None,
    search: Optional[str] = None,
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    is_new: Optional[bool] = None,
    is_popular: Optional[bool] = None,
    fuzzy: Optional[bool] = True,  # Включить нечеткий поиск по умолчанию
    limit: int = Query(100, le=1000),
    skip: int = 0
):
    """Get products with filtering and fuzzy search support"""
    query = {}
    
    if category_id:
        query['category_id'] = category_id
    
    if subcategory_id:
        query['subcategory_id'] = subcategory_id
    
    if third_level_id:
        query['third_level_id'] = third_level_id
    
    # Для fuzzy search - сначала получаем все товары, потом фильтруем
    # Для обычного поиска - используем regex MongoDB
    if search and not fuzzy:
        query['$or'] = [
            {'name': {'$regex': search, '$options': 'i'}},
            {'description': {'$regex': search, '$options': 'i'}},
            {'brand': {'$regex': search, '$options': 'i'}},
            {'sku': {'$regex': search, '$options': 'i'}}
        ]
    
    if brand:
        query['brand'] = brand
    
    if min_price is not None or max_price is not None:
        query['price'] = {}
        if min_price is not None:
            query['price']['$gte'] = min_price
        if max_price is not None:
            query['price']['$lte'] = max_price
    
    if is_new is not None:
        query['is_new'] = is_new
    
    if is_popular is not None:
        query['is_popular'] = is_popular
    
    # Если fuzzy search включен, получаем больше товаров для фильтрации
    fetch_limit = limit * 10 if search and fuzzy else limit
    
    products = await db.products.find(query, {"_id": 0}).skip(skip).limit(fetch_limit).to_list(fetch_limit)
    
    # Применяем fuzzy search
    if search and fuzzy:
        products = fuzzy_search_products(products, search, threshold=40)
        products = products[:limit]  # Ограничиваем результат
    
    return products

@router.get("/count")
async def get_products_count(
    category_id: Optional[str] = None,
    subcategory_id: Optional[str] = None,
    search: Optional[str] = None,
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None
):
    """Get total count of products matching filters"""
    query = {}
    
    if category_id:
        query['category_id'] = category_id
    
    if subcategory_id:
        query['subcategory_id'] = subcategory_id
    
    if search:
        query['$or'] = [
            {'name': {'$regex': search, '$options': 'i'}},
            {'description': {'$regex': search, '$options': 'i'}},
            {'brand': {'$regex': search, '$options': 'i'}}
        ]
    
    if brand:
        query['brand'] = brand
    
    if min_price is not None or max_price is not None:
        query['price'] = {}
        if min_price is not None:
            query['price']['$gte'] = min_price
        if max_price is not None:
            query['price']['$lte'] = max_price
    
    count = await db.products.count_documents(query)
    return {"count": count}

@router.get("/brands")
async def get_brands():
    """Get all unique brands"""
    brands = await db.products.distinct("brand")
    return {"brands": sorted(brands)}

@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get a single product by ID"""
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/slug/{slug}", response_model=Product)
async def get_product_by_slug(slug: str):
    """Get a single product by slug"""
    product = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/", dependencies=[Depends(verify_admin_token)])
async def create_product(product: Product):
    """Create a new product (Admin only)"""
    product_dict = product.dict()
    product_dict['created_at'] = datetime.utcnow()
    product_dict['updated_at'] = datetime.utcnow()
    
    # AUTO-TRANSLATE specs to specs_en if specs exist
    if product_dict.get('specs') and not product_dict.get('specs_en'):
        product_dict['specs_en'] = auto_translate_specs(product_dict['specs'])
    
    result = await db.products.insert_one(product_dict)
    return {"id": product.id, "message": "Product created successfully"}

@router.put("/{product_id}", dependencies=[Depends(verify_admin_token)])
async def update_product(product_id: str, product: Product):
    """Update a product (Admin only)"""
    product_dict = product.dict()
    product_dict['updated_at'] = datetime.utcnow()
    
    # AUTO-TRANSLATE specs to specs_en if specs exist and specs_en is empty
    if product_dict.get('specs') and not product_dict.get('specs_en'):
        product_dict['specs_en'] = auto_translate_specs(product_dict['specs'])
    
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": product_dict}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product updated successfully"}

@router.delete("/{product_id}", dependencies=[Depends(verify_admin_token)])
async def delete_product(product_id: str):
    """Delete a product (Admin only)"""
    result = await db.products.delete_one({"id": product_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully"}
