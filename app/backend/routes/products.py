from fastapi import APIRouter, Depends, HTTPException, Query
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')
from models import Product
from database import db, client
from middleware import verify_admin_token
import os
import re
from typing import List, Optional
from datetime import datetime, timezone
from rapidfuzz import fuzz, process
from pydantic import BaseModel
import json

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get('/page')
async def get_products_page(
    category_id: Optional[str] = None, subcategory_id: Optional[str] = None,
    third_level_id: Optional[str] = None, search: Optional[str] = Query(None, max_length=200),
    brand: Optional[str] = Query(None, max_length=200), min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0), in_stock: Optional[bool] = None,
    sort: str = Query('popular', pattern='^(popular|new|price_asc|price_desc|name)$'),
    page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100),
    brands: List[str] = Query(default=[]), spec_filters: Optional[str] = Query(None, max_length=8000),
    language: str = Query('ru', pattern='^(ru|en)$'),
):
    """Filter and paginate across the full Mongo collection before returning a page."""
    scope = {}
    for key, value in [('category_id', category_id), ('subcategory_id', subcategory_id), ('third_level_id', third_level_id)]:
        if value: scope[key] = value
    if in_stock is not None: scope['in_stock'] = in_stock
    if search and search.strip():
        terms = [re.escape(term) for term in search.strip().split()[:8]]
        scope['$and'] = [{'$or': [{field: {'$regex': term, '$options': 'i'}} for field in ('name','name_en','brand','sku','description')]} for term in terms]
    facet_scope = dict(scope)
    selected_brands = [x.strip() for x in ([brand] if brand else []) + brands if x.strip()]
    if selected_brands:
        if len(selected_brands) > 50 or any(len(x) > 200 for x in selected_brands):
            raise HTTPException(status_code=422, detail='Too many or oversized brand filters')
        scope['brand'] = {'$in': [re.compile(f'^{re.escape(value)}$', re.IGNORECASE) for value in selected_brands]}
    filters = {}
    if min_price is not None or max_price is not None:
        filters['price_on_request'] = {'$ne': True}
        filters['price'] = {}
        if min_price is not None: filters['price']['$gte'] = min_price
        if max_price is not None: filters['price']['$lte'] = max_price
        if min_price is not None and max_price is not None and min_price > max_price:
            raise HTTPException(status_code=422, detail='Minimum price cannot exceed maximum price')
    if spec_filters:
        try:
            selected_specs=json.loads(spec_filters)
        except (TypeError, ValueError):
            raise HTTPException(status_code=422, detail='Invalid specification filters')
        if not isinstance(selected_specs, dict) or len(selected_specs)>50:
            raise HTTPException(status_code=422, detail='Invalid specification filters')
        for key, values in selected_specs.items():
            if not isinstance(key,str) or not key.strip() or len(key)>160 or any(char in key for char in '.$') or not isinstance(values,list) or len(values)>50:
                raise HTTPException(status_code=422, detail='Invalid specification filter')
            clean=[value.strip() for value in values if isinstance(value,str) and value.strip() and len(value)<=200]
            if len(clean)!=len(values): raise HTTPException(status_code=422, detail='Invalid specification value')
            if clean:
                if key.strip().casefold() in {'brand','бренд'}:
                    filters['brand']={'$in':[re.compile(f'^{re.escape(value)}$', re.IGNORECASE) for value in clean]}
                    continue
                field=('specs_en' if language=='en' else 'specs')+'.'+key
                filters[field]={'$in':[re.compile(f'^{re.escape(value)}$', re.IGNORECASE) for value in clean]}
    match = {'$and': [scope, filters]} if filters else scope
    sort_doc = {'price_on_request': 1, 'price': 1, 'id': 1} if sort == 'price_asc' else {'price_on_request': 1, 'price': -1, 'id': 1} if sort == 'price_desc' else {'is_popular': -1, 'id': 1} if sort == 'popular' else {'is_new': -1, 'id': 1} if sort == 'new' else {'name': 1, 'id': 1}
    total = await db.products.count_documents(match)
    rows = await db.products.find(match, {'_id':0}).sort(list(sort_doc.items())).skip((page-1)*page_size).limit(page_size).to_list(page_size)
    brands = await db.products.distinct('brand', facet_scope)
    category_ids = await db.products.distinct('category_id', facet_scope)
    return {'items': rows, 'total': total, 'page': page, 'page_size': page_size,
            'pages': (total + page_size - 1)//page_size, 'facets': {
                'brands': sorted(x for x in brands if isinstance(x,str) and x.strip()),
                'category_ids': sorted(x for x in category_ids if isinstance(x,str) and x.strip())}}

# MongoDB connection

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
    search: Optional[str] = Query(None, max_length=200),
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    is_new: Optional[bool] = None,
    is_popular: Optional[bool] = None,
    in_stock: Optional[bool] = None,
    fuzzy: Optional[bool] = True,  # Включить нечеткий поиск по умолчанию
    limit: int = Query(100, ge=1, le=1000),
    skip: int = Query(0, ge=0)
):
    """Get products with filtering and fuzzy search support"""
    query = {}
    if in_stock is not None:
        query['in_stock'] = in_stock
    
    if category_id:
        query['category_id'] = category_id
    
    if subcategory_id:
        query['subcategory_id'] = subcategory_id
    
    if third_level_id:
        query['third_level_id'] = third_level_id
    
    # Для fuzzy search - сначала получаем все товары, потом фильтруем
    # Для обычного поиска - используем regex MongoDB
    if search and not fuzzy:
        search = re.escape(search)
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
        search = re.escape(search)
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
    product_dict['created_at'] = datetime.now(timezone.utc)
    product_dict['updated_at'] = datetime.now(timezone.utc)
    
    # AUTO-TRANSLATE specs to specs_en if specs exist
    if product_dict.get('specs') and not product_dict.get('specs_en'):
        product_dict['specs_en'] = auto_translate_specs(product_dict['specs'])
    
    result = await db.products.insert_one(product_dict)
    return {"id": product.id, "message": "Product created successfully"}

@router.put("/{product_id}", dependencies=[Depends(verify_admin_token)])
async def update_product(product_id: str, product: Product):
    """Update a product (Admin only)"""
    product_dict = product.dict()
    product_dict['id'] = product_id
    product_dict.pop('created_at', None)
    product_dict['updated_at'] = datetime.now(timezone.utc)
    
    # AUTO-TRANSLATE specs to specs_en if specs exist and specs_en is empty
    if product_dict.get('specs') and not product_dict.get('specs_en'):
        product_dict['specs_en'] = auto_translate_specs(product_dict['specs'])
    
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": product_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product updated successfully"}

@router.delete("/{product_id}", dependencies=[Depends(verify_admin_token)])
async def delete_product(product_id: str):
    """Delete a product (Admin only)"""
    result = await db.products.delete_one({"id": product_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully"}
