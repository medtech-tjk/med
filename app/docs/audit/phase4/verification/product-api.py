"""Exercise Mongo filtering/pagination against the disposable audit database only."""
import asyncio
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
runtime = json.loads((Path(__file__).parent / 'mongo-runtime.json').read_text())
assert runtime.get('disposable') is True
assert runtime.get('database') == 'medtech_audit_isolated'
os.environ.update(MONGO_URL=runtime['uri'], DB_NAME=runtime['database'], APP_ENV='test', ADMIN_TOKEN='offline-audit-credential-32-chars')
sys.path.insert(0, str(ROOT / 'backend'))
from database import client, db
from routes.products import get_products_page

async def main():
    prefix = 'audit-pagination-'
    await db.products.delete_many({'id': {'$regex': f'^{prefix}'}})
    await db.products.insert_many([
        {'id': f'{prefix}{i:03d}', 'name': f'Diagnostic device {i:03d}', 'brand': 'Acme' if i < 30 else 'Beta',
         'category_id': 'audit-category', 'subcategory_id': 'audit-subcategory', 'in_stock': i % 2 == 0,
         'price': i + 1, 'price_on_request': False, 'is_popular': i % 3 == 0,
         'specs': {'Тип': 'Портативный' if i < 15 else 'Стационарный'}}
        for i in range(205)
    ])
    try:
        result = await get_products_page(category_id='audit-category', subcategory_id='audit-subcategory',
            third_level_id=None, search='Diagnostic', brand=None, min_price=None, max_price=None,
            in_stock=None, sort='price_asc', page=3, page_size=20, brands=[], spec_filters=None, language='ru')
        assert result['total'] == 205 and result['pages'] == 11
        assert len(result['items']) == 20 and result['items'][0]['id'] == f'{prefix}040'
        assert result['facets']['brands'] == ['Acme', 'Beta']
        acme = await get_products_page(category_id='audit-category', subcategory_id=None,
            third_level_id=None, search=None, brand=None, min_price=None, max_price=None,
            in_stock=True, sort='price_desc', page=1, page_size=20, brands=['Acme'],
            spec_filters=json.dumps({'Тип':['Портативный']}), language='ru')
        assert acme['total'] == 8
        assert all(item['brand'] == 'Acme' and item['in_stock'] and item['specs']['Тип'] == 'Портативный' for item in acme['items'])
        assert acme['items'][0]['price'] == 15
        print(json.dumps({'disposable_database': runtime['database'], 'seeded_products': 205,
            'pagination_total_pages': result['pages'], 'page_three_first_id': result['items'][0]['id'],
            'filtered_total': acme['total'], 'facets': result['facets']}, ensure_ascii=False))
    finally:
        await db.products.delete_many({'id': {'$regex': f'^{prefix}'}})
        await client.close()

asyncio.run(main())
