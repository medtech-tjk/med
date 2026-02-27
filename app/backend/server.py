from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path

# Setup paths and load env
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory BEFORE importing routes
uploads_dir = ROOT_DIR / "uploads"
uploads_dir.mkdir(parents=True, exist_ok=True)

# Create documents directory
documents_dir = uploads_dir / "documents"
documents_dir.mkdir(parents=True, exist_ok=True)

# Import routes after uploads dir is created
from routes import categories, products, orders, featured, upload, news, slides, admin, settings

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'tib_tekhnologiya')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Create the main app without a prefix
app = FastAPI(title="Tib Tekhnologiya API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Add your routes to the router
@api_router.get("/")
async def root():
    return {"message": "Tib Tekhnologiya API"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}

# Include all route modules
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(featured.router)
app.include_router(upload.router)
app.include_router(news.router)
app.include_router(slides.router)
app.include_router(admin.router)
app.include_router(settings.router)

# Include the main api router
app.include_router(api_router)

# Mount uploads directory for static file serving
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
