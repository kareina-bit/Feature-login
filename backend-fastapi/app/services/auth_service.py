"""
Auth Service - Authentication and authorization logic
"""
from datetime import timedelta
from typing import Optional, Tuple
from app.core.security import verify_password, create_access_token, hash_password
from app.core.exceptions import unauthorized, bad_request, conflict, not_found
from app.core.config import settings
from app.models.user import UserModel, UserRole
from app.models.otp import OTPType
from app.services.user_service import UserService
from app.services.otp_service import OTPService
from app.services.sms_service import sms_service


class AuthService:
    """Authentication service"""
    
    @staticmethod
    async def register_user(
        name: str,
        email: str,
        phone: str,
        password: str,
        role: UserRole,
        otp: str
    ) -> Tuple[dict, str]:
        """
        Register a new user
        
        Args:
            name: User's full name
            email: User's email
            phone: User's phone number
            password: Plain text password
            role: User role
            otp: OTP code for verification
            
        Returns:
            Tuple of (user_document, jwt_token)
            
        Raises:
            ConflictException: If user already exists
            BadRequestException: If OTP is invalid
        """
        # Check if user already exists
        existing_user = await UserService.check_user_exists(phone=phone, email=email)
        if existing_user:
            raise conflict("Số điện thoại hoặc email đã được sử dụng")
        
        # Verify OTP
        await OTPService.verify_otp(phone, otp, OTPType.REGISTRATION)
        
        # Create user (verified since OTP is valid)
        user = await UserService.create_user(
            name=name,
            email=email,
            phone=phone,
            password=password,
            role=role,
            is_verified=True
        )
        
        # Delete OTP after use
        await OTPService.delete_otp(phone, OTPType.REGISTRATION)
        
        # Generate JWT token
        token = create_access_token(
            data={
                "userId": str(user['_id']),
                "phone": user['phone'],
                "role": user['role']
            }
        )
        
        return user, token
    
    @staticmethod
    async def login_user(phone: str, password: str) -> Tuple[dict, str]:
        """
        Login user
        
        Args:
            phone: User's phone number
            password: Plain text password
            
        Returns:
            Tuple of (user_document, jwt_token)
            
        Raises:
            UnauthorizedException: If credentials are invalid
        """
        # Find user by phone
        user = await UserService.get_user_by_phone(phone)
        
        if not user:
            raise unauthorized("Số điện thoại hoặc mật khẩu không chính xác")
        
        # Verify password
        if not verify_password(password, user['password']):
            raise unauthorized("Số điện thoại hoặc mật khẩu không chính xác")
        
        # Generate JWT token
        token = create_access_token(
            data={
                "userId": str(user['_id']),
                "phone": user['phone'],
                "role": user['role']
            }
        )
        
        return user, token
    
    @staticmethod
    async def send_otp(phone: str, otp_type: str) -> dict:
        """
        Send OTP to phone number
        
        Args:
            phone: User's phone number
            otp_type: Type of OTP (registration, reset-password)
            
        Returns:
            OTP document (without code for security)
            
        Raises:
            BadRequestException: If phone validation fails
        """
        # Convert string to OTPType enum
        try:
            otp_type_enum = OTPType(otp_type)
        except ValueError:
            raise bad_request("Loại OTP không hợp lệ")
        
        # For registration, check if user already exists
        if otp_type_enum == OTPType.REGISTRATION:
            existing_user = await UserService.get_user_by_phone(phone)
            if existing_user:
                raise conflict("Số điện thoại đã được đăng ký")
        
        # For reset password, check if user exists
        if otp_type_enum == OTPType.RESET_PASSWORD:
            user = await UserService.get_user_by_phone(phone)
            if not user:
                raise not_found("Số điện thoại chưa được đăng ký")
        
        # Create OTP
        otp_doc = await OTPService.create_otp(phone, otp_type_enum)
        
        # Send OTP via SMS
        await sms_service.send_otp(phone, otp_doc['code'], otp_type)
        
        # Return OTP info (without code for security)
        return {
            "phone": otp_doc['phone'],
            "type": otp_doc['type'],
            "expiresAt": otp_doc['expiresAt']
        }
    
    @staticmethod
    async def verify_otp(phone: str, code: str, otp_type: str) -> bool:
        """
        Verify OTP code
        
        Args:
            phone: User's phone number
            code: OTP code
            otp_type: Type of OTP
            
        Returns:
            True if OTP is valid
            
        Raises:
            BadRequestException: If OTP is invalid
        """
        # Convert string to OTPType enum
        try:
            otp_type_enum = OTPType(otp_type)
        except ValueError:
            raise bad_request("Loại OTP không hợp lệ")
        
        # Verify OTP
        return await OTPService.verify_otp(phone, code, otp_type_enum)
    
    @staticmethod
    async def reset_password(phone: str, new_password: str, otp: str) -> dict:
        """
        Reset user password
        
        Args:
            phone: User's phone number
            new_password: New plain text password
            otp: OTP code for verification
            
        Returns:
            Updated user document
            
        Raises:
            NotFoundException: If user not found
            BadRequestException: If OTP is invalid
        """
        # Find user
        user = await UserService.get_user_by_phone(phone)
        if not user:
            raise not_found("Số điện thoại chưa được đăng ký")
        
        # Verify OTP
        await OTPService.verify_otp(phone, otp, OTPType.RESET_PASSWORD)
        
        # Update password
        updated_user = await UserService.update_password(str(user['_id']), new_password)
        
        # Delete OTP after use
        await OTPService.delete_otp(phone, OTPType.RESET_PASSWORD)
        
        return updated_user
    
    @staticmethod
    async def create_admin_user():
        """
        Create default admin user if not exists
        
        This is called during application startup
        """
        # Check if admin already exists
        admin = await UserService.get_user_by_phone(settings.ADMIN_PHONE)
        
        if not admin:
            # Create admin user
            await UserService.create_user(
                name=settings.ADMIN_NAME,
                email=f"admin@shipway.vn",
                phone=settings.ADMIN_PHONE,
                password=settings.ADMIN_PASSWORD,
                role=UserRole.ADMIN,
                is_verified=True
            )
            print(f"✅ Admin user created: {settings.ADMIN_PHONE}")
        else:
            print(f"✅ Admin user already exists: {settings.ADMIN_PHONE}")

