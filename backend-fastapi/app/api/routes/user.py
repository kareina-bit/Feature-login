"""
User Management Routes
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.response import SuccessResponse, PaginatedResponse
from app.models.user import UserModel, UserRole
from app.services.user_service import UserService
from app.api.dependencies import get_current_user, get_current_admin
from app.core.exceptions import AppException

router = APIRouter()


@router.get("/me", response_model=SuccessResponse[UserResponse])
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current user information
    
    - Requires authentication
    - Returns current user data
    """
    return {
        "success": True,
        "message": "User retrieved successfully",
        "data": UserModel.to_response(current_user)
    }


@router.put("/me", response_model=SuccessResponse[UserResponse])
async def update_current_user(
    update_data: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update current user information
    
    - Requires authentication
    - Updates user profile
    """
    try:
        # Remove None values
        update_dict = update_data.model_dump(exclude_unset=True)
        
        if not update_dict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No update data provided"
            )
        
        # Update user
        updated_user = await UserService.update_user(
            str(current_user['_id']),
            update_dict
        )
        
        return {
            "success": True,
            "message": "User updated successfully",
            "data": UserModel.to_response(updated_user)
        }
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/", response_model=PaginatedResponse[UserResponse])
async def get_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    role: Optional[UserRole] = None,
    current_user: dict = Depends(get_current_admin)
):
    """
    Get all users (Admin only)
    
    - Requires admin authentication
    - Returns paginated user list
    - Can filter by role
    """
    try:
        skip = (page - 1) * limit
        
        # Get users
        users = await UserService.get_all_users(
            skip=skip,
            limit=limit,
            role=role
        )
        
        # Get total count
        total = await UserService.count_users(role=role)
        
        # Convert to response format
        users_response = [UserModel.to_response(user) for user in users]
        
        return {
            "success": True,
            "message": "Users retrieved successfully",
            "data": users_response,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/{user_id}", response_model=SuccessResponse[UserResponse])
async def get_user_by_id(
    user_id: str,
    current_user: dict = Depends(get_current_admin)
):
    """
    Get user by ID (Admin only)
    
    - Requires admin authentication
    - Returns user data
    """
    try:
        user = await UserService.get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "success": True,
            "message": "User retrieved successfully",
            "data": UserModel.to_response(user)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{user_id}", response_model=SuccessResponse)
async def delete_user(
    user_id: str,
    current_user: dict = Depends(get_current_admin)
):
    """
    Delete user by ID (Admin only)
    
    - Requires admin authentication
    - Permanently deletes user
    """
    try:
        # Prevent admin from deleting themselves
        if str(current_user['_id']) == user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete your own account"
            )
        
        success = await UserService.delete_user(user_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "success": True,
            "message": "User deleted successfully",
            "data": None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

