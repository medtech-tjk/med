"""One connection/configuration for every runtime route and maintenance command."""
import os
from pathlib import Path
from dotenv import load_dotenv
from pymongo import AsyncMongoClient

load_dotenv(Path(__file__).parent / '.env')
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://127.0.0.1:27017')
DB_NAME = os.environ.get('DB_NAME', 'tib_tekhnologiya')
client = AsyncMongoClient(MONGO_URL, serverSelectionTimeoutMS=5000, tz_aware=True)
db = client[DB_NAME]

async def ensure_indexes():
    # Non-unique catalog indexes are safe for an existing dataset. Uniqueness
    # migrations require a duplicate-data audit instead of failing live startup.
    await db.products.create_index([('category_id',1),('id',1)])
    await db.products.create_index([('subcategory_id',1),('id',1)])
    await db.products.create_index([('third_level_id',1),('id',1)])
    await db.products.create_index([('brand',1),('id',1)])
    await db.products.create_index([('price_on_request',1),('price',1),('id',1)])
    await db.orders.create_index([('created_at',-1),('id',1)])
    await db.admin_sessions.create_index('expires_at',expireAfterSeconds=0)
