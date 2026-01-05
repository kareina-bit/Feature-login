"""
Pydantic schemas for request/response validation
"""
from app.schemas.user import UserResponse, UserCreate, UserUpdate
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    SendOTPRequest,
    VerifyOTPRequest,
    ResetPasswordRequest,
    AuthResponse,
)
from app.schemas.response import (
    SuccessResponse,
    ErrorResponse,
    PaginatedResponse,
)

__all__ = [
    # User schemas
    "UserResponse",
    "UserCreate",
    "UserUpdate",
    # Auth schemas
    "RegisterRequest",
    "LoginRequest",
    "SendOTPRequest",
    "VerifyOTPRequest",
    "ResetPasswordRequest",
    "AuthResponse",
    # Response schemas
    "SuccessResponse",
    "ErrorResponse",
    "PaginatedResponse",
]

