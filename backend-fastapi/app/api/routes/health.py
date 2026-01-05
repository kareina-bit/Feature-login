"""
Health Check Routes
"""
from fastapi import APIRouter
from app.core.config import settings
from app.core.database import get_database

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Health check endpoint
    
    Returns system status and configuration
    """
    try:
        # Test database connection
        db = get_database()
        await db.command("ping")
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": db_status
    }


@router.get("/")
async def root():
    """
    Root endpoint
    
    Returns API information
    """
    return {
        "message": "Welcome to Shipway API",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/health"
    }

