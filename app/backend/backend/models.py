from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

class Category(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    name_en: Optional[str] = None  # Название на английском
    slug: str
    image: Optional[str] = None
    description: Optional[str] = None  # Описание категории
    description_en: Optional[str] = None  # Описание на английском
    order: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Subcategory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    name_en: Optional[str] = None  # Название на английском
    slug: str
    parent_id: str
    image: Optional[str] = None
    description: Optional[str] = None  # Описание подкатегории (редактируется админом)
    description_en: Optional[str] = None  # Описание на английском
    order: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ThirdLevelCategory(BaseModel):
    """Третий уровень категорий"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    name_en: Optional[str] = None  # Название на английском
    slug: str
    parent_id: str
    image: Optional[str] = None
    description: Optional[str] = None  # Описание
    description_en: Optional[str] = None  # Описание на английском
    order: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Группа характеристик с заголовком
class SpecGroup(BaseModel):
    title: str  # Заголовок группы: "Основные характеристики", "Технические характеристики"
    items: Dict[str, str] = {}  # Ключ-значение характеристик

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    name_en: Optional[str] = None  # Название на английском
    slug: str
    sku: Optional[str] = None
    category_id: str
    subcategory_id: Optional[str] = None
    third_level_id: Optional[str] = None
    price: float
    old_price: Optional[float] = None
    main_image: Optional[str] = None
    images: List[str] = []
    description: str = ""
    description_en: Optional[str] = None  # Описание на английском
    # Новая структура характеристик с группами
    spec_groups: List[SpecGroup] = []  # Группы характеристик с заголовками
    spec_groups_en: List[SpecGroup] = []  # Английские группы характеристик
    specs: Dict[str, str] = {}  # Характеристики на русском
    specs_en: Dict[str, str] = {}  # Характеристики на английском (КЛЮЧ и ЗНАЧЕНИЕ)
    brand: str = ""
    in_stock: bool = True
    is_new: bool = False
    is_popular: bool = False
    # PDF документация
    documents: List[Dict[str, str]] = []  # [{name: "Инструкция", url: "/uploads/...", type: "pdf"}]
    # Видео товара (YouTube, Vimeo и др.)
    video_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    phone: str
    address: str
    email: Optional[str] = None
    organization: Optional[str] = None
    message: Optional[str] = None
    items: List[Dict] = []
    total: float
    status: str = "new"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class FeaturedProduct(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    order: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AdminToken(BaseModel):
    token: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Settings(BaseModel):
    id: str = Field(default="global_settings")
    usd_to_tjs_rate: float = Field(default=11.2)  # Default exchange rate
    updated_at: datetime = Field(default_factory=datetime.utcnow)

