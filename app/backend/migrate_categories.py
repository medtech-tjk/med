#!/usr/bin/env python3
"""
Migration script to import categories from fullCatalogTree.js to MongoDB
Run this once to populate the database with initial categories
"""
import asyncio
import os
import uuid
from database import client, db

# Full catalog tree from fullCatalogTree.js
CATALOG_TREE = [
  {
    "id": str(uuid.uuid4()),
    "name": "Ультразвуковая диагностика",
    "slug": "ultrasound",
    "image": "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&h=400&fit=crop",
    "order": 1,
    "children": [
      {"name": "УЗИ аппараты", "slug": "uzi-devices"},
      {"name": "УЗИ датчики", "slug": "uzi-probes", "children": [
        {"name": "Линейные", "slug": "linear"},
        {"name": "Конвексные", "slug": "convex"},
        {"name": "Секторные фазированные", "slug": "phased"},
        {"name": "Микроконвексные", "slug": "microconvex"},
        {"name": "Внутриполостные", "slug": "endocavity"},
        {"name": "Чреспищеводные", "slug": "tee"},
        {"name": "Биопсийные", "slug": "biopsy"},
        {"name": "Объемные", "slug": "volume"},
        {"name": "Карандашные", "slug": "pencil"},
        {"name": "Интраоперационные", "slug": "intraoperative"}
      ]},
      {"name": "Тележки для УЗИ", "slug": "uzi-carts"},
      {"name": "Принтеры для УЗИ", "slug": "uzi-printers"},
      {"name": "Ультразвуковые денситометры", "slug": "densitometers"}
    ]
  },
  {
    "id": str(uuid.uuid4()),
    "name": "Гибкая эндоскопия",
    "slug": "flexible-endoscopy",
    "image": "https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&h=400&fit=crop",
    "order": 2,
    "children": [
      {"name": "Видеоэндоскопические системы", "slug": "video-systems"},
      {"name": "Гастроскопы", "slug": "gastroscopes"},
      {"name": "Колоноскопы", "slug": "colonoscopes"},
      {"name": "Бронхоскопы", "slug": "bronchoscopes"},
      {"name": "Риноларингоскопы", "slug": "rhinolaryngoscopes"},
      {"name": "Дуоденоскопы", "slug": "duodenoscopes"},
      {"name": "Эндоскопические инструменты", "slug": "endoscopic-tools"},
      {"name": "Моечное оборудование", "slug": "washing-equipment"},
      {"name": "Инсуффляторы", "slug": "insufflators"},
      {"name": "Аспираторы", "slug": "aspirators"},
      {"name": "Тележки и стойки", "slug": "endoscopy-carts"},
      {"name": "Комплектующие и расходные материалы", "slug": "consumables"},
      {"name": "Капсульная эндоскопия", "slug": "capsule-endoscopy"},
      {"name": "Видеоректоскопы", "slug": "videorectoscopes"}
    ]
  },
  {
    "id": str(uuid.uuid4()),
    "name": "Жесткая эндоскопия",
    "slug": "rigid-endoscopy",
    "image": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop",
    "order": 3,
    "children": [
      {"name": "Лапароскопическое оборудование", "slug": "laparoscopic"},
      {"name": "Артроскопическое оборудование", "slug": "arthroscopic"},
      {"name": "Гистероскопическое оборудование", "slug": "hysteroscopic"},
      {"name": "Цистоскопическое оборудование", "slug": "cystoscopic"},
      {"name": "Риноскопическое оборудование", "slug": "rhinoscopic"},
      {"name": "Торакоскопическое оборудование", "slug": "thoracoscopic"},
      {"name": "Источники света", "slug": "light-sources"},
      {"name": "Оптические системы", "slug": "optical-systems"},
      {"name": "Видеокамеры", "slug": "video-cameras"}
    ]
  },
  {
    "id": str(uuid.uuid4()),
    "name": "Лучевая диагностика",
    "slug": "radiology",
    "image": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop",
    "order": 4,
    "children": [
      {"name": "Рентгеновские аппараты", "slug": "xray"},
      {"name": "Компьютерные томографы", "slug": "ct-scanners"},
      {"name": "Магнитно-резонансные томографы", "slug": "mri"},
      {"name": "Маммографы", "slug": "mammographs"},
      {"name": "Ангиографы", "slug": "angiographs"},
      {"name": "Флюорографы", "slug": "fluorographs"},
      {"name": "Рентгенозащитное оборудование", "slug": "radiation-protection"},
      {"name": "Системы архивации изображений", "slug": "pacs"},
      {"name": "Рентгеновские трубки", "slug": "xray-tubes"},
      {"name": "Детекторы", "slug": "detectors"}
    ]
  },
  {
    "id": str(uuid.uuid4()),
    "name": "Анестезиология и реанимация",
    "slug": "anesthesiology",
    "image": "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=600&h=400&fit=crop",
    "order": 5,
    "children": [
      {"name": "Аппараты ИВЛ", "slug": "ventilators"},
      {"name": "Наркозно-дыхательные аппараты", "slug": "anesthesia-machines"},
      {"name": "Мониторы пациента", "slug": "patient-monitors"},
      {"name": "Инфузионные насосы", "slug": "infusion-pumps"},
      {"name": "Шприцевые насосы", "slug": "syringe-pumps"},
      {"name": "Дефибрилляторы", "slug": "defibrillators"},
      {"name": "Аспираторы хирургические", "slug": "surgical-aspirators"},
      {"name": "Ларингоскопы", "slug": "laryngoscopes"},
      {"name": "Анестезиологические тележки", "slug": "anesthesia-carts"}
    ]
  },
  {
    "id": str(uuid.uuid4()),
    "name": "Хирургическое оборудование",
    "slug": "surgical",
    "image": "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=600&h=400&fit=crop",
    "order": 6,
    "children": [
      {"name": "Операционные столы", "slug": "tables"},
      {"name": "Операционные светильники", "slug": "surgical-lights"},
      {"name": "Электрохирургические аппараты", "slug": "electrosurgical"},
      {"name": "Хирургические инструменты", "slug": "surgical-instruments"},
      {"name": "Аргоноплазменная коагуляция", "slug": "argon-plasma"},
      {"name": "Ультразвуковые скальпели", "slug": "ultrasonic-scalpels"},
      {"name": "Отсосы хирургические", "slug": "surgical-suction"},
      {"name": "Потолочные консоли", "slug": "ceiling-pendants"},
      {"name": "Операционные микроскопы", "slug": "surgical-microscopes"}
    ]
  },
  {
    "id": str(uuid.uuid4()),
    "name": "Акушерство и гинекология",
    "slug": "obstetrics-gynecology",
    "image": "https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&h=400&fit=crop",
    "order": 7,
    "children": [
      {"name": "Гинекологические кресла", "slug": "chairs"},
      {"name": "Кольпоскопы", "slug": "colposcopes"},
      {"name": "Фетальные мониторы", "slug": "fetal-monitors"},
      {"name": "Родильные кровати", "slug": "delivery-beds"},
      {"name": "Инкубаторы для новорожденных", "slug": "incubators"},
      {"name": "Фототерапевтические системы", "slug": "phototherapy"},
      {"name": "Системы обогрева новорожденных", "slug": "warming-systems"},
      {"name": "Аспираторы неонатальные", "slug": "neonatal-aspirators"},
      {"name": "Весы медицинские", "slug": "medical-scales"}
    ]
  },
  {
    "id": str(uuid.uuid4()),
    "name": "Лабораторное оборудование",
    "slug": "laboratory",
    "image": "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=600&h=400&fit=crop",
    "order": 8,
    "children": [
      {"name": "Анализаторы крови", "slug": "blood-analyzers"},
      {"name": "Биохимические анализаторы", "slug": "biochemistry-analyzers"},
      {"name": "Центрифуги", "slug": "centrifuges"},
      {"name": "Микроскопы", "slug": "microscopes"},
      {"name": "Коагулометры", "slug": "coagulometers"},
      {"name": "Анализаторы мочи", "slug": "urine-analyzers"},
      {"name": "ПЦР-оборудование", "slug": "pcr-equipment"},
      {"name": "Холодильное оборудование", "slug": "refrigeration"},
      {"name": "Стерилизаторы", "slug": "sterilizers"},
      {"name": "Термостаты", "slug": "thermostats"}
    ]
  }
]

async def migrate_categories():
    configured_name=os.environ.get('DB_NAME','').strip()
    if not configured_name or os.environ.get('MIGRATION_CONFIRM_DB_NAME') != configured_name:
        raise RuntimeError('Set DB_NAME and MIGRATION_CONFIRM_DB_NAME to the exact intended database before migration')
    if os.environ.get('APP_ENV','').lower() in {'production','prod'}:
        raise RuntimeError('This sample category migration cannot run in production')
    """Migrate categories to MongoDB"""
    print("Starting category migration...")
    
    # Clear existing data
    await db.categories.delete_many({})
    await db.subcategories.delete_many({})
    
    for category in CATALOG_TREE:
        cat_id = category.get("id", str(uuid.uuid4()))
        
        # Insert main category
        cat_doc = {
            "id": cat_id,
            "name": category["name"],
            "slug": category["slug"],
            "image": category.get("image", ""),
            "order": category.get("order", 0),
            "description": ""
        }
        await db.categories.insert_one(cat_doc)
        print(f"  + Category: {category['name']}")
        
        # Insert subcategories
        for idx, child in enumerate(category.get("children", [])):
            sub_id = str(uuid.uuid4())
            sub_doc = {
                "id": sub_id,
                "parent_id": cat_id,
                "name": child["name"],
                "slug": child["slug"],
                "order": idx,
                "description": ""
            }
            await db.subcategories.insert_one(sub_doc)
            print(f"    - Subcategory: {child['name']}")
            
            # Insert third-level categories
            for idx2, grandchild in enumerate(child.get("children", [])):
                gc_id = str(uuid.uuid4())
                gc_doc = {
                    "id": gc_id,
                    "parent_id": sub_id,
                    "name": grandchild["name"],
                    "slug": grandchild["slug"],
                    "order": idx2,
                    "description": ""
                }
                await db.subcategories.insert_one(gc_doc)
                print(f"      * Sub-subcategory: {grandchild['name']}")
    
    print("\nMigration completed!")
    
    # Count results
    cat_count = await db.categories.count_documents({})
    sub_count = await db.subcategories.count_documents({})
    print(f"Total categories: {cat_count}")
    print(f"Total subcategories: {sub_count}")

if __name__ == "__main__":
    async def main():
        try:
            await migrate_categories()
        finally:
            await client.close()
    asyncio.run(main())
