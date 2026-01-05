"""
Database models
"""
from app.models.user import UserRole, UserModel
from app.models.otp import OTPType, OTPModel

__all__ = [
    "UserRole",
    "UserModel",
    "OTPType",
    "OTPModel",
]

