import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def init_settings():
    """Initialize global settings with default currency rate"""
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'tib_tekhnologiya')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Check if settings exist
    existing_settings = await db.settings.find_one({"id": "global_settings"})
    
    if existing_settings:
        print(f"✅ Settings already exist:")
        print(f"   USD to TJS rate: {existing_settings.get('usd_to_tjs_rate', 'N/A')}")
        print(f"   Last updated: {existing_settings.get('updated_at', 'N/A')}")
    else:
        # Create default settings
        default_settings = {
            "id": "global_settings",
            "usd_to_tjs_rate": 11.2,
            "updated_at": datetime.utcnow()
        }
        
        await db.settings.insert_one(default_settings)
        print("✅ Created default settings:")
        print(f"   USD to TJS rate: {default_settings['usd_to_tjs_rate']}")
        print(f"   Created at: {default_settings['updated_at']}")
    
    client.close()

if __name__ == "__main__":
    print("🔧 Initializing global settings...")
    asyncio.run(init_settings())
    print("✅ Done!")
