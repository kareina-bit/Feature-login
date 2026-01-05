"""
Authentication Routes
"""
from fastapi import APIRouter, HTTPException, status
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    SendOTPRequest,
    VerifyOTPRequest,
    ResetPasswordRequest,
    AuthResponse,
)
from app.schemas.response import SuccessResponse
from app.models.user import UserModel
from app.services.auth_service import AuthService
from app.core.exceptions import AppException

router = APIRouter()


@router.post("/register", response_model=AuthResponse)
async def register(request: RegisterRequest):
    """
    Register a new user
    
    - Requires OTP verification
    - Creates user account
    - Returns user data and JWT token
    """
    try:
        user, token = await AuthService.register_user(
            name=request.name,
            email=request.email,
            phone=request.phone,
            password=request.password,
            role=request.role,
            otp=request.otp
        )
        
        return {
            "success": True,
            "message": "Đăng ký thành công",
            "user": UserModel.to_response(user),
            "token": token
        }
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """
    Login user
    
    - Authenticates user with phone and password
    - Returns user data and JWT token
    """
    try:
        user, token = await AuthService.login_user(
            phone=request.phone,
            password=request.password
        )
        
        return {
            "success": True,
            "message": "Đăng nhập thành công",
            "user": UserModel.to_response(user),
            "token": token
        }
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/send-otp", response_model=SuccessResponse)
async def send_otp(request: SendOTPRequest):
    """
    Send OTP to phone number
    
    - For registration or password reset
    - Sends OTP via SMS (Twilio)
    - OTP valid for 5 minutes
    """
    try:
        otp_info = await AuthService.send_otp(
            phone=request.phone,
            otp_type=request.type
        )
        
        return {
            "success": True,
            "message": "Mã OTP đã được gửi",
            "data": otp_info
        }
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/verify-otp", response_model=SuccessResponse)
async def verify_otp(request: VerifyOTPRequest):
    """
    Verify OTP code
    
    - Validates OTP code
    - Marks OTP as verified
    """
    try:
        is_valid = await AuthService.verify_otp(
            phone=request.phone,
            code=request.code,
            otp_type=request.type
        )
        
        return {
            "success": True,
            "message": "Xác thực OTP thành công",
            "data": {"verified": is_valid}
        }
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/reset-password", response_model=SuccessResponse)
async def reset_password(request: ResetPasswordRequest):
    """
    Reset user password
    
    - Requires OTP verification
    - Updates user password
    """
    try:
        user = await AuthService.reset_password(
            phone=request.phone,
            new_password=request.newPassword,
            otp=request.otp
        )
        
        return {
            "success": True,
            "message": "Đặt lại mật khẩu thành công",
            "data": UserModel.to_response(user)
        }
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

