"""
Authentication Schemas - Request/Response models
"""
from pydantic import BaseModel, EmailStr, Field, field_validator
from app.models.user import UserRole
from app.schemas.user import UserResponse


class RegisterRequest(BaseModel):
    """Schema for user registration"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r'^\+84\d{9,10}$')
    password: str = Field(..., min_length=8, max_length=100)
    role: UserRole = Field(default=UserRole.USER)
    otp: str = Field(..., min_length=6, max_length=6)
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength"""
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        if not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in v):
            raise ValueError('Password must contain at least one special character')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Nguyễn Văn A",
                "email": "user@example.com",
                "phone": "+84397912441",
                "password": "SecurePass123!",
                "role": "user",
                "otp": "123456"
            }
        }


class LoginRequest(BaseModel):
    """Schema for user login"""
    phone: str = Field(..., pattern=r'^\+84\d{9,10}$')
    password: str = Field(..., min_length=1)
    
    class Config:
        json_schema_extra = {
            "example": {
                "phone": "+84397912441",
                "password": "SecurePass123!"
            }
        }


class SendOTPRequest(BaseModel):
    """Schema for sending OTP"""
    phone: str = Field(..., pattern=r'^\+84\d{9,10}$')
    type: str = Field(..., pattern=r'^(registration|reset-password)$')
    
    class Config:
        json_schema_extra = {
            "example": {
                "phone": "+84397912441",
                "type": "registration"
            }
        }


class VerifyOTPRequest(BaseModel):
    """Schema for verifying OTP"""
    phone: str = Field(..., pattern=r'^\+84\d{9,10}$')
    code: str = Field(..., min_length=6, max_length=6)
    type: str = Field(..., pattern=r'^(registration|reset-password)$')
    
    class Config:
        json_schema_extra = {
            "example": {
                "phone": "+84397912441",
                "code": "123456",
                "type": "registration"
            }
        }


class ResetPasswordRequest(BaseModel):
    """Schema for resetting password"""
    phone: str = Field(..., pattern=r'^\+84\d{9,10}$')
    newPassword: str = Field(..., min_length=8, max_length=100)
    otp: str = Field(..., min_length=6, max_length=6)
    
    @field_validator('newPassword')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength"""
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        if not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in v):
            raise ValueError('Password must contain at least one special character')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "phone": "+84397912441",
                "newPassword": "NewSecurePass123!",
                "otp": "123456"
            }
        }


class AuthResponse(BaseModel):
    """Schema for authentication response"""
    success: bool
    message: str
    user: UserResponse
    token: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Login successful",
                "user": {
                    "id": "507f1f77bcf86cd799439011",
                    "name": "Nguyễn Văn A",
                    "email": "user@example.com",
                    "phone": "+84397912441",
                    "role": "user",
                    "isVerified": True,
                    "createdAt": "2024-01-01T00:00:00Z",
                    "updatedAt": "2024-01-01T00:00:00Z"
                },
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
        }

