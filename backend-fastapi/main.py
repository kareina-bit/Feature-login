"""
FastAPI Application Entry Point
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.core.config import settings
from app.core.database import connect_db, close_db
from app.middleware import setup_cors, setup_error_handlers
from app.api import api_router
from app.services.auth_service import AuthService


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan events
    
    - Startup: Connect to database, create admin user, setup indexes
    - Shutdown: Close database connection
    """
    # Startup
    print(f"🚀 Starting {settings.APP_NAME} v{settings.VERSION}")
    print(f"🌍 Environment: {settings.ENVIRONMENT}")
    
    # Connect to database
    await connect_db()
    
    # Create default admin user
    await AuthService.create_admin_user()
    
    # Create indexes (optional - MongoDB Atlas can auto-create these)
    from app.models.user import USER_INDEXES
    from app.models.otp import OTP_INDEXES
    from app.core.database import get_users_collection, get_otps_collection
    
    try:
        # Create user indexes
        users_collection = get_users_collection()
        for index in USER_INDEXES:
            await users_collection.create_index(
                index["keys"],
                **index["options"]
            )
        print("✅ User indexes created")
        
        # Create OTP indexes
        otps_collection = get_otps_collection()
        for index in OTP_INDEXES:
            await otps_collection.create_index(
                index["keys"],
                **index["options"]
            )
        print("✅ OTP indexes created")
    except Exception as e:
        print(f"⚠️  Index creation warning: {e}")
    
    print(f"✅ Server ready on port {settings.PORT}")
    
    yield
    
    # Shutdown
    print("👋 Shutting down...")
    await close_db()


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Shipway Transportation Company - Backend API",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Setup middleware
setup_cors(app)
setup_error_handlers(app)

# Include API routes
app.include_router(api_router, prefix="/api")


# Root endpoint (for testing)
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Shipway API",
        "version": settings.VERSION,
        "docs": "/docs",
        "api": "/api",
        "health": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=(settings.ENVIRONMENT == "development")
    )
