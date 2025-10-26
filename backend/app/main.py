from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.products import router as products_router
from app.orders import router as orders_router

app = FastAPI(title="Kiox API", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://kiox-ruby.vercel.app",
        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products_router)
app.include_router(orders_router)

@app.get("/")
async def root():
    return {"message": "Kiox API is running", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
