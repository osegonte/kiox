from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
from datetime import datetime, timedelta
from app.database import get_supabase

router = APIRouter(prefix="/v1/orders", tags=["orders"])

class OrderItem(BaseModel):
    product_id: str
    qty: int

class CreateOrder(BaseModel):
    shop_id: str
    items: List[OrderItem]

class Order(BaseModel):
    id: str
    shop_id: str
    status: str
    payment_status: str
    subtotal_kobo: int
    discount_kobo: int
    total_kobo: int
    created_at: str

@router.post("", response_model=Order)
async def create_order(order_data: CreateOrder):
    """Create a new order"""
    supabase = get_supabase()
    
    # Fetch products and calculate totals
    product_ids = [item.product_id for item in order_data.items]
    products_result = supabase.table('products').select('*').in_('id', product_ids).execute()
    
    if len(products_result.data) != len(product_ids):
        raise HTTPException(status_code=404, detail="One or more products not found")
    
    products_map = {p['id']: p for p in products_result.data}
    
    # Calculate totals
    subtotal = 0
    order_items = []
    
    for item in order_data.items:
        product = products_map.get(item.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        
        line_total = item.qty * product['price_kobo']
        subtotal += line_total
        
        order_items.append({
            'product_id': item.product_id,
            'qty': item.qty,
            'unit_price_kobo': product['price_kobo'],
            'line_total_kobo': line_total
        })
    
    # Create order
    eta = datetime.utcnow() + timedelta(hours=2)
    
    order_result = supabase.table('orders').insert({
        'shop_id': order_data.shop_id,
        'status': 'pending',
        'payment_status': 'unpaid',
        'subtotal_kobo': subtotal,
        'discount_kobo': 0,
        'total_kobo': subtotal,
        'eta_at': eta.isoformat()
    }).execute()
    
    if not order_result.data:
        raise HTTPException(status_code=500, detail="Failed to create order")
    
    order = order_result.data[0]
    
    # Create order items
    for item_data in order_items:
        item_data['order_id'] = order['id']
        supabase.table('order_items').insert(item_data).execute()
    
    # Create audit log
    supabase.table('audit_log').insert({
        'actor_id': 'system',
        'role': 'admin',
        'entity': 'order',
        'entity_id': order['id'],
        'action': 'created',
        'metadata': {'shop_id': order_data.shop_id, 'items_count': len(order_items)}
    }).execute()
    
    return order

@router.get("/{order_id}", response_model=Order)
async def get_order(order_id: str):
    """Get order by ID"""
    supabase = get_supabase()
    
    result = supabase.table('orders').select('*').eq('id', order_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return result.data[0]
