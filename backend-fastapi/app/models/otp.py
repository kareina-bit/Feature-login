"""
OTP Model - Database representation
"""
from datetime import datetime, timedelta
from enum import Enum
from app.core.config import settings


class OTPType(str, Enum):
    """OTP type enumeration"""
    REGISTRATION = "registration"
    RESET_PASSWORD = "reset-password"


class OTPModel:
    """
    OTP document structure in MongoDB
    
    This is a reference model - we work with dicts directly in Motor
    """
    
    COLLECTION_NAME = "otps"
    
    @staticmethod
    def create_document(
        phone: str,
        code: str,
        otp_type: OTPType,
        expire_minutes: int = None,
    ) -> dict:
        """
        Create an OTP document
        
        Args:
            phone: User's phone number
            code: OTP code (6 digits)
            otp_type: Type of OTP (registration, reset-password)
            expire_minutes: Minutes until OTP expires
            
        Returns:
            OTP document dict
        """
        if expire_minutes is None:
            expire_minutes = settings.OTP_EXPIRE_MINUTES
        
        now = datetime.utcnow()
        expires_at = now + timedelta(minutes=expire_minutes)
        
        return {
            "phone": phone,
            "code": code,
            "type": otp_type.value if isinstance(otp_type, OTPType) else otp_type,
            "isVerified": False,
            "createdAt": now,
            "expiresAt": expires_at,
        }
    
    @staticmethod
    def is_expired(otp_doc: dict) -> bool:
        """
        Check if OTP is expired
        
        Args:
            otp_doc: OTP document from MongoDB
            
        Returns:
            True if expired, False otherwise
        """
        if not otp_doc:
            return True
        
        expires_at = otp_doc.get("expiresAt")
        if not expires_at:
            return True
        
        return datetime.utcnow() > expires_at
    
    @staticmethod
    def is_valid(otp_doc: dict) -> bool:
        """
        Check if OTP is valid (not expired and not verified)
        
        Args:
            otp_doc: OTP document from MongoDB
            
        Returns:
            True if valid, False otherwise
        """
        if not otp_doc:
            return False
        
        return (
            not otp_doc.get("isVerified", False) and
            not OTPModel.is_expired(otp_doc)
        )


# Indexes to create on otps collection
OTP_INDEXES = [
    {
        "keys": [("phone", 1), ("type", 1)],
        "options": {"name": "phone_type_idx"}
    },
    {
        "keys": [("expiresAt", 1)],
        "options": {
            "name": "ttl_idx",
            "expireAfterSeconds": 0  # TTL index - auto-delete when expiresAt is reached
        }
    },
]

