from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.database import get_supabase

router = APIRouter(prefix="/v1/products", tags=["products"])

class Product(BaseModel):
    id: str
    sku: str
    name: str
    brand: Optional[str]
    category: Optional[str]
    unit: str
    price_kobo: int
    active: bool

@router.get("", response_model=List[Product])
async def list_products(
    active: bool = True,
    category: Optional[str] = None,
    search: Optional[str] = None
):
    """List all products with optional filters"""
    supabase = get_supabase()
    
    query = supabase.table('products').select('*')
    
    if active is not None:
        query = query.eq('active', active)
    
    if category:
        query = query.eq('category', category)
    
    if search:
        query = query.ilike('name', f'%{search}%')
    
    result = query.execute()
    return result.data

@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get a single product by ID"""
    supabase = get_supabase()
    
    result = supabase.table('products').select('*').eq('id', product_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return result.data[0]
