from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.database import get_supabase
import uuid

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

class CreateProduct(BaseModel):
    sku: str
    name: str
    brand: Optional[str] = None
    category: Optional[str] = None
    unit: str = "piece"
    price_kobo: int
    active: bool = True

class UpdateProduct(BaseModel):
    sku: Optional[str] = None
    name: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    price_kobo: Optional[int] = None
    active: Optional[bool] = None

@router.get("", response_model=List[Product])
async def list_products(
    active: Optional[bool] = None,
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

@router.post("", response_model=Product)
async def create_product(product_data: CreateProduct):
    """Create a new product"""
    supabase = get_supabase()
    
    # Check if SKU already exists
    existing = supabase.table('products').select('id').eq('sku', product_data.sku).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Product with this SKU already exists")
    
    # Create product
    new_product = {
        'id': str(uuid.uuid4()),
        **product_data.dict()
    }
    
    result = supabase.table('products').insert(new_product).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create product")
    
    return result.data[0]

@router.put("/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: UpdateProduct):
    """Update an existing product"""
    supabase = get_supabase()
    
    # Check if product exists
    existing = supabase.table('products').select('*').eq('id', product_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Update only provided fields
    update_data = {k: v for k, v in product_data.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = supabase.table('products').update(update_data).eq('id', product_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to update product")
    
    return result.data[0]

@router.delete("/{product_id}")
async def delete_product(product_id: str):
    """Soft delete a product (set active=false)"""
    supabase = get_supabase()
    
    result = supabase.table('products').update({'active': False}).eq('id', product_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deactivated successfully"}
