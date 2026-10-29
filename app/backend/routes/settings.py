from fastapi import APIRouter, Depends, HTTPException
from database import db, client
from middleware import verify_admin_token
from models import Settings
import os
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

router = APIRouter(prefix="/api/settings", tags=["Settings"])

# MongoDB connection

@router.get("")
async def get_settings():
    """Get global settings including USD to TJS exchange rate"""
    try:
        settings = await db.settings.find_one({"id": "global_settings"}, {"_id": 0})
        
        # If no settings exist, return defaults
        if not settings:
            default_settings = {
                "id": "global_settings",
                "usd_to_tjs_rate": 11.2,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            return default_settings
        
        return settings
    except Exception as e:
        # If database error, return defaults
        return {
            "id": "global_settings",
            "usd_to_tjs_rate": 11.2,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

@router.put("", dependencies=[Depends(verify_admin_token)])
async def update_settings(settings: Settings):
    """Update global settings (Admin only)"""
    settings_dict = settings.dict()
    # Use isoformat for proper JSON serialization
    settings_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    
    try:
        # Upsert (update or insert)
        result = await db.settings.update_one(
            {"id": "global_settings"},
            {"$set": settings_dict},
            upsert=True
        )
        
        return {"message": "Settings updated successfully", "settings": settings_dict}
    except Exception as e:
        print(f"[SETTINGS] ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update settings: {str(e)}")
