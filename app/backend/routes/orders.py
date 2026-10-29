from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from dotenv import load_dotenv
from pathlib import Path
import httpx
import logging
from html import escape

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')
from models import Order
from database import db, client
from middleware import verify_admin_token
import os
from datetime import datetime, timezone
from typing import Literal
from uuid import uuid4

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/orders", tags=["Orders"])

# MongoDB connection

# Telegram config
TELEGRAM_TOKEN = os.environ.get('TELEGRAM_TOKEN')
TELEGRAM_CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID')

class StatusUpdate(BaseModel):
    status: Literal['new', 'processing', 'completed', 'cancelled']

async def send_telegram_notification(order: dict):
    """Send order notification to Telegram bot"""
    if not TELEGRAM_TOKEN or not TELEGRAM_CHAT_ID:
        logger.warning("Telegram credentials not configured")
        return False
    
    try:
        # Format items list
        items_text = ""
        has_price_on_request = False
        for i, item in enumerate(order.get('items', []), 1):
            item_name = escape(str(item.get('name', 'Товар')))
            item_qty = item.get('quantity', 1)
            if item.get('price_on_request'):
                has_price_on_request = True
                price_text = "по запросу"
            else:
                item_price = item.get('price', 0)
                price_text = f"{item_price:,.0f} сом"
            items_text += f"\n   {i}. {item_name} x{item_qty} = {price_text}"
        
        total_text = f"{order.get('total', 0):,.0f} сом"
        if has_price_on_request:
            total_text += " + по запросу"
            
        # Create message
        message = f"""🛒 <b>НОВАЯ ЗАЯВКА!</b>

👤 <b>ФИО:</b> {escape(str(order.get('full_name', '-')))}
📞 <b>Телефон:</b> {escape(str(order.get('phone', '-')))}
📍 <b>Адрес:</b> {escape(str(order.get('address', '-')))}
📧 <b>Email:</b> {escape(str(order.get('email') or 'не указан'))}
🏢 <b>Организация:</b> {escape(str(order.get('organization') or 'не указана'))}

📦 <b>Товары:</b>{items_text}

💰 <b>ИТОГО:</b> {total_text}

💬 <b>Комментарий:</b> {escape(str(order.get('message') or 'нет'))}

🆔 Заказ: {escape(str(order.get('id', '-')))}
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
    order_dict = order.model_dump()
    order_dict['id'] = str(uuid4())
    # Cart data is editable in the browser: read prices and names from the catalog.
    product_ids = list({item.id for item in order.items})
    products = await db.products.find({'id': {'$in': product_ids}}, {'_id': 0}).to_list(len(product_ids))
    catalog = {product['id']: product for product in products}
    if any(product_id not in catalog for product_id in product_ids):
        raise HTTPException(status_code=400, detail='One or more products are no longer available')
    for item in order_dict['items']:
        product = catalog[item['id']]
        item['name'] = product['name']
        item['brand'] = product.get('brand', '')
        item['price_on_request'] = bool(product.get('price_on_request', False))
        item['price'] = 0 if item['price_on_request'] else product['price']
    order_dict['total'] = round(sum(item['price'] * item['quantity'] for item in order_dict['items']), 2)
    order_dict['created_at'] = datetime.now(timezone.utc)
    order_dict['status'] = 'new'
    
    # Save to database
    result = await db.orders.insert_one(order_dict)
    
    # Send Telegram notification
    await send_telegram_notification(order_dict)
    
    return {"id": order_dict['id'], "message": "Заявка успешно отправлена"}

@router.get("/", dependencies=[Depends(verify_admin_token)])
async def get_orders(skip: int = 0, limit: int = 100):
    """Get all orders (for admin)"""
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return orders

@router.get("/{order_id}", dependencies=[Depends(verify_admin_token)])
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
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": "Order status updated successfully"}
