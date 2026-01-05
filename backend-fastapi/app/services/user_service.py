"""
User Service - User management logic
"""
from typing import Optional, List
from bson import ObjectId
from app.core.database import get_users_collection
from app.core.security import hash_password
from app.models.user import UserModel, UserRole
from app.core.exceptions import not_found, conflict, bad_request


class UserService:
    """User service for managing user operations"""
    
    @staticmethod
    async def get_user_by_id(user_id: str) -> Optional[dict]:
        """
        Get user by ID
        
        Args:
            user_id: User ID
            
        Returns:
            User document or None
        """
        try:
            collection = get_users_collection()
            user = await collection.find_one({"_id": ObjectId(user_id)})
            return user
        except Exception:
            return None
    
    @staticmethod
    async def get_user_by_phone(phone: str) -> Optional[dict]:
        """
        Get user by phone number
        
        Args:
            phone: Phone number
            
        Returns:
            User document or None
        """
        collection = get_users_collection()
        user = await collection.find_one({"phone": phone})
        return user
    
    @staticmethod
    async def get_user_by_email(email: str) -> Optional[dict]:
        """
        Get user by email
        
        Args:
            email: Email address
            
        Returns:
            User document or None
        """
        collection = get_users_collection()
        user = await collection.find_one({"email": email})
        return user
    
    @staticmethod
    async def check_user_exists(phone: Optional[str] = None, email: Optional[str] = None) -> bool:
        """
        Check if user exists by phone or email
        
        Args:
            phone: Phone number (optional)
            email: Email address (optional)
            
        Returns:
            True if user exists
        """
        if phone:
            user = await UserService.get_user_by_phone(phone)
            if user:
                return True
        
        if email:
            user = await UserService.get_user_by_email(email)
            if user:
                return True
        
        return False
    
    @staticmethod
    async def create_user(
        name: str,
        email: str,
        phone: str,
        password: str,
        role: UserRole = UserRole.USER,
        is_verified: bool = False
    ) -> dict:
        """
        Create a new user
        
        Args:
            name: User's full name
            email: User's email
            phone: User's phone number
            password: Plain text password (will be hashed)
            role: User role
            is_verified: Verification status
            
        Returns:
            Created user document
            
        Raises:
            ConflictException: If user already exists
        """
        collection = get_users_collection()
        
        # Check if user already exists
        if await UserService.check_user_exists(phone=phone, email=email):
            raise conflict("Người dùng đã tồn tại")
        
        # Hash password
        hashed_password = hash_password(password)
        
        # Create user document
        user_doc = UserModel.create_document(
            name=name,
            email=email,
            phone=phone,
            password=hashed_password,
            role=role,
            is_verified=is_verified
        )
        
        # Insert into database
        result = await collection.insert_one(user_doc)
        user_doc['_id'] = result.inserted_id
        
        return user_doc
    
    @staticmethod
    async def update_user(user_id: str, update_data: dict) -> dict:
        """
        Update user information
        
        Args:
            user_id: User ID
            update_data: Data to update
            
        Returns:
            Updated user document
            
        Raises:
            NotFoundException: If user not found
        """
        collection = get_users_collection()
        
        # Check if user exists
        user = await UserService.get_user_by_id(user_id)
        if not user:
            raise not_found("Người dùng không tồn tại")
        
        # Update timestamp
        update_data['updatedAt'] = __import__('datetime').datetime.utcnow()
        
        # Update user
        await collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        # Get updated user
        updated_user = await UserService.get_user_by_id(user_id)
        return updated_user
    
    @staticmethod
    async def update_password(user_id: str, new_password: str) -> dict:
        """
        Update user password
        
        Args:
            user_id: User ID
            new_password: New plain text password (will be hashed)
            
        Returns:
            Updated user document
        """
        hashed_password = hash_password(new_password)
        
        return await UserService.update_user(
            user_id,
            {"password": hashed_password}
        )
    
    @staticmethod
    async def delete_user(user_id: str) -> bool:
        """
        Delete a user
        
        Args:
            user_id: User ID
            
        Returns:
            True if deleted successfully
        """
        collection = get_users_collection()
        
        result = await collection.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0
    
    @staticmethod
    async def get_all_users(
        skip: int = 0,
        limit: int = 10,
        role: Optional[UserRole] = None
    ) -> List[dict]:
        """
        Get all users with pagination
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            role: Filter by role (optional)
            
        Returns:
            List of user documents
        """
        collection = get_users_collection()
        
        query = {}
        if role:
            query['role'] = role.value
        
        cursor = collection.find(query).skip(skip).limit(limit)
        users = await cursor.to_list(length=limit)
        
        return users
    
    @staticmethod
    async def count_users(role: Optional[UserRole] = None) -> int:
        """
        Count total users
        
        Args:
            role: Filter by role (optional)
            
        Returns:
            Total number of users
        """
        collection = get_users_collection()
        
        query = {}
        if role:
            query['role'] = role.value
        
        count = await collection.count_documents(query)
        return count

