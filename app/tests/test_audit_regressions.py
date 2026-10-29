"""Offline security/SEO regression checks. No production database or messages."""
import asyncio
import json
from pathlib import Path
import sys
import unittest
from unittest.mock import AsyncMock, MagicMock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'backend'))
from fastapi import FastAPI
from fastapi.testclient import TestClient
from routes import orders, prerender, products
from models import Order
from pydantic import ValidationError


class AuditRegressionTests(unittest.TestCase):
    def test_stock_filter_reaches_database(self):
        fake_db = MagicMock()
        cursor = fake_db.products.find.return_value
        cursor.skip.return_value = cursor
        cursor.limit.return_value = cursor
        cursor.to_list = AsyncMock(return_value=[])
        app = FastAPI()
        app.include_router(products.router)
        with patch.object(products, 'db', fake_db):
            response = TestClient(app).get('/api/products/?in_stock=true')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(fake_db.products.find.call_args.args[0].get('in_stock'), True)

    def test_order_uses_catalog_prices_not_browser_prices(self):
        fake_db = MagicMock()
        fake_db.products.find.return_value.to_list = AsyncMock(return_value=[{'id':'a','name':'Actual device','price':120,'price_on_request':False,'brand':'Test'}])
        fake_db.orders.insert_one = AsyncMock()
        payload = Order(full_name='Buyer', phone='+992123456789', address='Dushanbe', items=[{'id':'a','name':'Forged name','price':1,'quantity':2}], total=2)
        with patch.object(orders, 'db', fake_db), patch.object(orders, 'send_telegram_notification', new_callable=AsyncMock):
            asyncio.run(orders.create_order(payload))
        saved = fake_db.orders.insert_one.call_args.args[0]
        self.assertEqual(saved['total'], 240)
        self.assertEqual(saved['items'][0]['name'], 'Actual device')

    def test_empty_and_negative_orders_rejected(self):
        invalid = [
            {'full_name': ' ', 'phone': '+992123456789', 'address': 'Dushanbe', 'items': [{'id':'a','name':'a','price':0,'quantity':1}], 'total': 0},
            {'full_name': 'Test', 'phone': '+992123456789', 'address': 'Dushanbe', 'items': [], 'total': 0},
            {'full_name': 'Test', 'phone': '+992123456789', 'address': 'Dushanbe', 'items': [{'id':'a','name':'a','price':-1,'quantity':-1}], 'total': -1},
        ]
        for payload in invalid:
            with self.subTest(payload=payload), self.assertRaises(ValidationError):
                Order(**payload)

    def test_order_details_require_admin(self):
        app = FastAPI()
        app.include_router(orders.router)
        fake_db = AsyncMock()
        fake_db.orders.find_one.return_value = {'id': 'example', 'phone': 'private'}
        with patch.object(orders, 'db', fake_db):
            response = TestClient(app).get('/api/orders/example')
        self.assertEqual(response.status_code, 401)
        fake_db.orders.find_one.assert_not_awaited()

    def test_authorized_admin_can_read_order(self):
        app = FastAPI()
        app.include_router(orders.router)
        app.dependency_overrides[orders.verify_admin_token] = lambda: True
        fake_db = AsyncMock()
        fake_db.orders.find_one.return_value = {'id': 'example'}
        with patch.object(orders, 'db', fake_db):
            response = TestClient(app).get('/api/orders/example')
        self.assertEqual(response.status_code, 200)

    def test_bot_html_has_brand_icon_and_new_address(self):
        markup = prerender.build_base_html('Title', 'Description', 'https://medtech.tj/')
        self.assertIn('/favicon-96x96.png', markup)
        self.assertIn('Академика Акобира Адхамова, 11/5', markup)

    def test_jsonld_cannot_break_out_of_script(self):
        payload = json.dumps({'name': '</script><script>alert(1)</script>'})
        markup = prerender.build_base_html('Title', 'Desc', '/', json_ld=payload)
        self.assertNotIn('</script><script>alert(1)', markup)

    def test_telegram_customer_text_is_escaped(self):
        client = AsyncMock()
        client.post.return_value.status_code = 200
        manager = AsyncMock()
        manager.__aenter__.return_value = client
        with patch.object(orders, 'TELEGRAM_TOKEN', 'offline-test'), patch.object(orders, 'TELEGRAM_CHAT_ID', 'offline'), patch.object(orders.httpx, 'AsyncClient', return_value=manager):
            asyncio.run(orders.send_telegram_notification({'full_name': '<b>Customer</b>', 'items': [{'name': '<script>x</script>', 'quantity': 1}]}))
        message = client.post.call_args.kwargs['json']['text']
        self.assertIn('&lt;b&gt;Customer&lt;/b&gt;', message)
        self.assertNotIn('<script>', message)


if __name__ == '__main__':
    unittest.main()
