import asyncio
from datetime import datetime, timezone
from database import db, client

async def init_settings():
    """Initialize global settings with default currency rate"""
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
            "updated_at": datetime.now(timezone.utc)
        }
        
        await db.settings.insert_one(default_settings)
        print("✅ Created default settings:")
        print(f"   USD to TJS rate: {default_settings['usd_to_tjs_rate']}")
        print(f"   Created at: {default_settings['updated_at']}")
    
    await client.close()

if __name__ == "__main__":
    print("🔧 Initializing global settings...")
    asyncio.run(init_settings())
    print("✅ Done!")
