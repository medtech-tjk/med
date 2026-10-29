import asyncio
import re
import sys
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'backend'))
from routes import products


def test_page_counts_and_slices_filtered_inventory_in_database():
    collection = MagicMock()
    collection.count_documents = AsyncMock(return_value=47)
    cursor = MagicMock()
    cursor.sort.return_value = cursor
    cursor.skip.return_value = cursor
    cursor.limit.return_value = cursor
    cursor.to_list = AsyncMock(return_value=[{'id':'p21','name':'Device','brand':'Acme'}])
    collection.find.return_value = cursor
    collection.distinct = AsyncMock(return_value=['Acme', None, ' '])
    original = products.db
    products.db = MagicMock(products=collection)
    try:
        result = asyncio.run(products.get_products_page(category_id='c1', subcategory_id=None,
            third_level_id=None, search=None, brand=None, min_price=None, max_price=None,
            in_stock=None, sort='popular', page=3, page_size=20, brands=[], spec_filters=None, language='ru'))
    finally:
        products.db = original
    assert result['total'] == 47
    assert result['pages'] == 3
    assert result['items'][0]['id'] == 'p21'
    assert result['facets']['brands'] == ['Acme']
    collection.find.assert_called_once_with({'category_id':'c1'}, {'_id':0})
    cursor.skip.assert_called_once_with(40)
    cursor.limit.assert_called_once_with(20)


def test_price_filter_excludes_quote_only_items_and_escapes_search():
    collection = MagicMock()
    collection.count_documents = AsyncMock(return_value=0)
    cursor = MagicMock()
    cursor.sort.return_value = cursor
    cursor.skip.return_value = cursor
    cursor.limit.return_value = cursor
    cursor.to_list = AsyncMock(return_value=[])
    collection.find.return_value = cursor
    collection.distinct = AsyncMock(return_value=[])
    original = products.db
    products.db = MagicMock(products=collection)
    try:
        asyncio.run(products.get_products_page(category_id=None, subcategory_id=None,
            third_level_id=None, search='a+b', brand=None, min_price=10, max_price=50,
            in_stock=None, sort='price_asc', page=1, page_size=20, brands=[], spec_filters=None, language='ru'))
    finally:
        products.db = original
    match = collection.count_documents.call_args.args[0]
    regex = match['$and'][0]['$and'][0]['$or'][0]['name']['$regex']
    assert regex == re.escape('a+b')
    assert "price_on_request" in match['$and'][1]
    assert match['$and'][1]['price'] == {'$gte':10, '$lte':50}
