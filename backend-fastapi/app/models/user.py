"""
User Model - Database representation
"""
from datetime import datetime
from typing import Optional
from enum import Enum


class UserRole(str, Enum):
    """User roles enumeration"""
    ADMIN = "admin"
    USER = "user"       # Shipping partner
    DRIVER = "driver"   # Delivery driver


class UserModel:
    """
    User document structure in MongoDB
    
    This is a reference model - we work with dicts directly in Motor
    """
    
    COLLECTION_NAME = "users"
    
    # Default structure
    @staticmethod
    def create_document(
        name: str,
        email: str,
        phone: str,
        password: str,
        role: UserRole,
        is_verified: bool = False,
    ) -> dict:
        """
        Create a user document
        
        Args:
            name: User's full name
            email: User's email address
            phone: User's phone number (E.164 format)
            password: Hashed password
            role: User role (admin, user, driver)
            is_verified: Email/phone verification status
            
        Returns:
            User document dict
        """
        now = datetime.utcnow()
        
        return {
            "name": name,
            "email": email,
            "phone": phone,
            "password": password,  # Already hashed
            "role": role.value if isinstance(role, UserRole) else role,
            "isVerified": is_verified,
            "createdAt": now,
            "updatedAt": now,
        }
    
    @staticmethod
    def to_response(user_doc: dict) -> dict:
        """
        Convert MongoDB document to API response format
        
        Args:
            user_doc: User document from MongoDB
            
        Returns:
            User data without sensitive fields
        """
        if not user_doc:
            return None
        
        return {
            "id": str(user_doc.get("_id")),
            "name": user_doc.get("name"),
            "email": user_doc.get("email"),
            "phone": user_doc.get("phone"),
            "role": user_doc.get("role"),
            "isVerified": user_doc.get("isVerified", False),
            "createdAt": user_doc.get("createdAt"),
            "updatedAt": user_doc.get("updatedAt"),
        }


# Indexes to create on users collection
USER_INDEXES = [
    {
        "keys": [("email", 1)],
        "options": {"unique": True, "name": "email_unique_idx"}
    },
    {
        "keys": [("phone", 1)],
        "options": {"unique": True, "name": "phone_unique_idx"}
    },
    {
        "keys": [("role", 1)],
        "options": {"name": "role_idx"}
    },
]

