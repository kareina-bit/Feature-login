"""
API routes module
"""
from fastapi import APIRouter
from app.api.routes import auth, user, health

# Create main API router
api_router = APIRouter()

# Include sub-routers
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(user.router, prefix="/users", tags=["Users"])

__all__ = ["api_router"]

