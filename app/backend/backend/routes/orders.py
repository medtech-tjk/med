from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from dotenv import load_dotenv
from pathlib import Path
import httpx
import logging

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')
from models import Order
from motor.motor_asyncio import AsyncIOMotorClient
from middleware import verify_admin_token
import os
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/orders", tags=["Orders"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# Telegram config
TELEGRAM_TOKEN = os.environ.get('TELEGRAM_TOKEN')
TELEGRAM_CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID')

class StatusUpdate(BaseModel):
    status: str

async def send_telegram_notification(order: dict):
    """Send order notification to Telegram bot"""
    if not TELEGRAM_TOKEN or not TELEGRAM_CHAT_ID:
        logger.warning("Telegram credentials not configured")
        return False
    
    try:
        # Format items list
        items_text = ""
        for i, item in enumerate(order.get('items', []), 1):
            item_name = item.get('name', 'Товар')
            item_qty = item.get('quantity', 1)
            item_price = item.get('price', 0)
            items_text += f"\n   {i}. {item_name} x{item_qty} = {item_price:,.0f} сом"
        
        # Create message
        message = f"""🛒 <b>НОВАЯ ЗАЯВКА!</b>

👤 <b>ФИО:</b> {order.get('full_name', '-')}
📞 <b>Телефон:</b> {order.get('phone', '-')}
📍 <b>Адрес:</b> {order.get('address', '-')}
📧 <b>Email:</b> {order.get('email', '-') or 'не указан'}
🏢 <b>Организация:</b> {order.get('organization', '-') or 'не указана'}

📦 <b>Товары:</b>{items_text}

💰 <b>ИТОГО:</b> {order.get('total', 0):,.0f} сом

💬 <b>Комментарий:</b> {order.get('message', '-') or 'нет'}

🆔 Заказ: {order.get('id', '-')}
📅 {datetime.now().strftime('%d.%m.%Y %H:%M')}"""
        
        url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json={
                    "chat_id": TELEGRAM_CHAT_ID,
                    "text": message,
                    "parse_mode": "HTML"
                },
                timeout=10.0
            )
            
            if response.status_code == 200:
                logger.info(f"Telegram notification sent for order {order.get('id')}")
                return True
            else:
                logger.error(f"Telegram API error: {response.text}")
                return False
                
    except Exception as e:
        logger.error(f"Failed to send Telegram notification: {str(e)}")
        return False

@router.post("/")
async def create_order(order: Order):
    """Create a new order and send notification to Telegram"""
    order_dict = order.dict()
    order_dict['created_at'] = datetime.now(datetime.UTC)
    order_dict['status'] = 'new'
    
    # Save to database
    result = await db.orders.insert_one(order_dict)
    
    # Send Telegram notification
    await send_telegram_notification(order_dict)
    
    return {"id": order.id, "message": "Заявка успешно отправлена"}

@router.get("/", dependencies=[Depends(verify_admin_token)])
async def get_orders(skip: int = 0, limit: int = 100):
    """Get all orders (for admin)"""
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return orders

@router.get("/{order_id}")
async def get_order(order_id: str):
    """Get a single order by ID"""
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.patch("/{order_id}/status", dependencies=[Depends(verify_admin_token)])
async def update_order_status(order_id: str, status_update: StatusUpdate):
    """Update order status"""
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status_update.status}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": "Order status updated successfully"}
