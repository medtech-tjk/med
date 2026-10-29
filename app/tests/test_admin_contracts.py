"""Offline admin contract tests; no live database mutations."""
import asyncio
from pathlib import Path
import re
import sys
import unittest
from unittest.mock import AsyncMock, MagicMock, patch
from types import SimpleNamespace

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'backend'))
from fastapi.routing import APIRoute
from fastapi.testclient import TestClient
from server import app
from routes import products, slides, featured, orders
from models import Product

class AdminContractTests(unittest.TestCase):
    def test_every_protected_endpoint_rejects_missing_token(self):
        checked=0
        client=TestClient(app)
        def protected_routes(routes):
            for route in routes:
                if isinstance(route, APIRoute):
                    if any(getattr(dep.call,'__name__',None)=='verify_admin_token' for dep in route.dependant.dependencies):
                        yield route
                elif hasattr(route, 'original_router'):
                    yield from protected_routes(route.original_router.routes)
                elif hasattr(route, 'router'):
                    yield from protected_routes(route.router.routes)
        for route in app.routes:
            for route in protected_routes([route]):
                path=re.sub(r'\{[^}]+\}','offline-test',route.path)
                for method in route.methods:
                    with self.subTest(method=method,path=path):
                        response=client.request(method,path,json={})
                        self.assertEqual(response.status_code,401)
                    checked+=1
        self.assertGreaterEqual(checked,20)

    def test_unchanged_product_update_keeps_identity_and_succeeds(self):
        fake=MagicMock()
        fake.products.update_one=AsyncMock(return_value=SimpleNamespace(matched_count=1,modified_count=0))
        product=Product(name='Device',slug='device',category_id='category',price=12)
        with patch.object(products,'db',fake):
            asyncio.run(products.update_product('existing-id',product))
        updated=fake.products.update_one.call_args.args[1]['$set']
        self.assertEqual(updated['id'],'existing-id')

    def test_unchanged_featured_order_is_not_missing(self):
        fake=MagicMock()
        fake.featured_products.update_one=AsyncMock(return_value=SimpleNamespace(matched_count=1,modified_count=0))
        with patch.object(featured,'db',fake):
            result=asyncio.run(featured.update_featured_order('existing',1))
        self.assertIn('message',result)

    def test_slide_update_keeps_identity(self):
        fake=MagicMock()
        fake.slides.update_one=AsyncMock(return_value=SimpleNamespace(matched_count=1,modified_count=0))
        slide=slides.Slide(title='Offline fixture',image='/test.png')
        with patch.object(slides,'db',fake):
            asyncio.run(slides.update_slide('slide-existing',slide))
        updated=fake.slides.update_one.call_args.args[1]['$set']
        self.assertEqual(updated['id'],'slide-existing')
        self.assertNotIn('created_at',updated)

if __name__=='__main__': unittest.main()
