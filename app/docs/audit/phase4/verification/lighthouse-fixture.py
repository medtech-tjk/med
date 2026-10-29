"""Seed/clean disposable catalog fixtures for local Lighthouse only."""
import asyncio, json, os, sys
from datetime import datetime, timezone
from pathlib import Path
runtime=json.loads((Path(__file__).parent/'mongo-runtime.json').read_text())
assert runtime.get('disposable') is True and runtime.get('database')=='medtech_audit_isolated'
os.environ.update(MONGO_URL=runtime['uri'],DB_NAME=runtime['database'],APP_ENV='test',ADMIN_TOKEN='offline-audit-credential-32-chars')
sys.path.insert(0,str(Path(__file__).resolve().parents[4]/'backend'))
from database import client,db

async def main():
    if sys.argv[1]=='seed':
        await db.products.delete_many({'id':'lighthouse-audit-device'})
        await db.categories.delete_many({'id':'lighthouse-audit-category'})
        await db.products.insert_one({'id':'lighthouse-audit-device','slug':'audit-device','name':'Audit Medical Device','name_en':'Audit Medical Device','brand':'Audit fixture','category_id':'lighthouse-audit-category','price':12000,'price_on_request':False,'in_stock':True,'description':'Local synthetic audit fixture.','specs':{},'images':[],'main_image':'/logo192.png','created_at':datetime.now(timezone.utc)})
        await db.categories.insert_one({'id':'lighthouse-audit-category','slug':'audit-category','name':'Audit category','name_en':'Audit category','image':'/logo192.png','order':1,'description':'Synthetic local audit fixture.'})
        print('Seeded only the disposable Lighthouse catalog fixtures.')
    elif sys.argv[1]=='cleanup':
        await db.products.delete_many({'id':'lighthouse-audit-device'})
        await db.categories.delete_many({'id':'lighthouse-audit-category'})
        print('Removed disposable Lighthouse catalog fixtures.')
    await client.close()
asyncio.run(main())
