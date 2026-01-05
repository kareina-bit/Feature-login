"""
API Dependencies - Dependency injection for routes
"""
from typing import Optional
from fastapi import Depends, Header, HTTPException, status
from jose import JWTError
from app.core.security import decode_access_token
from app.core.exceptions import unauthorized
from app.services.user_service import UserService
from app.models.user import UserRole


async def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Get current authenticated user from JWT token
    
    Args:
        authorization: Authorization header (Bearer token)
        
    Returns:
        User document
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing"
        )
    
    # Extract token from "Bearer <token>"
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme"
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format"
        )
    
    # Decode token
    try:
        payload = decode_access_token(token)
        user_id = payload.get("userId")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    # Get user from database
    user = await UserService.get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user


async def get_current_admin(current_user: dict = Depends(get_current_user)):
    """
    Check if current user is admin
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User document if admin
        
    Raises:
        HTTPException: If user is not admin
    """
    if current_user.get("role") != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return current_user


async def get_current_active_user(current_user: dict = Depends(get_current_user)):
    """
    Check if current user is active (verified)
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User document if active
        
    Raises:
        HTTPException: If user is not verified
    """
    if not current_user.get("isVerified"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account not verified"
        )
    
    return current_user


def require_role(required_role: UserRole):
    """
    Dependency factory to require specific role
    
    Args:
        required_role: Required user role
        
    Returns:
        Dependency function
    """
    async def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role")
        
        if user_role != required_role.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{required_role.value}' required"
            )
        
        return current_user
    
    return role_checker

