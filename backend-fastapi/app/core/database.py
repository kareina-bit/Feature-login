"""
MongoDB Database connection using Motor (async driver)
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional

from app.core.config import settings


class Database:
    """Database connection manager"""
    
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None


db_manager = Database()


async def connect_db():
    """Connect to MongoDB"""
    try:
        db_manager.client = AsyncIOMotorClient(settings.MONGODB_URI)
        db_manager.db = db_manager.client[settings.DATABASE_NAME]
        
        # Test connection
        await db_manager.client.admin.command('ping')
        
        print(f"✅ MongoDB Connected")
        print(f"📊 Database Name: {settings.DATABASE_NAME}")
    except Exception as e:
        print(f"❌ Error connecting to MongoDB: {e}")
        raise


async def close_db():
    """Close MongoDB connection"""
    if db_manager.client:
        db_manager.client.close()
        print("👋 MongoDB Connection Closed")


def get_database() -> AsyncIOMotorDatabase:
    """Get database instance"""
    if db_manager.db is None:
        raise RuntimeError("Database not initialized")
    return db_manager.db


# Collections
def get_users_collection():
    """Get users collection"""
    db = get_database()
    return db.users


def get_otps_collection():
    """Get OTPs collection"""
    db = get_database()
    return db.otps

