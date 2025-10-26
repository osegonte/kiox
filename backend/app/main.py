from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from app.products import router as products_router
from app.orders import router as orders_router
from app.database import get_supabase

app = FastAPI(
    title="Kiox API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(products_router)
app.include_router(orders_router)

@app.get("/health")
async def health_check():
    """Health check endpoint with DB verification"""
    try:
        supabase = get_supabase()
        # Test DB connection by counting products
        result = supabase.table('products').select('id', count='exact').limit(1).execute()
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "kiox-api",
        "version": "0.1.0",
        "database": db_status
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Kiox API",
        "docs": "/docs",
        "health": "/health"
    }
