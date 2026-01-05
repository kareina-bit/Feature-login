"""
OTP Service - OTP management logic
"""
from datetime import datetime
from app.core.database import get_otps_collection
from app.models.otp import OTPModel, OTPType
from app.utils.helpers import generate_otp
from app.core.exceptions import bad_request, not_found


class OTPService:
    """OTP service for managing OTP operations"""
    
    @staticmethod
    async def create_otp(phone: str, otp_type: OTPType) -> dict:
        """
        Create a new OTP for a phone number
        
        Args:
            phone: User's phone number
            otp_type: Type of OTP (registration, reset-password)
            
        Returns:
            OTP document
        """
        collection = get_otps_collection()
        
        # Delete any existing OTPs for this phone and type
        await collection.delete_many({
            "phone": phone,
            "type": otp_type.value
        })
        
        # Generate new OTP
        code = generate_otp(6)
        
        # Create OTP document
        otp_doc = OTPModel.create_document(
            phone=phone,
            code=code,
            otp_type=otp_type
        )
        
        # Insert into database
        result = await collection.insert_one(otp_doc)
        otp_doc['_id'] = result.inserted_id
        
        return otp_doc
    
    @staticmethod
    async def verify_otp(phone: str, code: str, otp_type: OTPType) -> bool:
        """
        Verify an OTP code
        
        Args:
            phone: User's phone number
            code: OTP code to verify
            otp_type: Type of OTP
            
        Returns:
            True if OTP is valid and verified
            
        Raises:
            BadRequestException: If OTP is invalid or expired
        """
        collection = get_otps_collection()
        
        # Find OTP
        otp_doc = await collection.find_one({
            "phone": phone,
            "type": otp_type.value,
            "code": code
        })
        
        if not otp_doc:
            raise bad_request("OTP không hợp lệ")
        
        # Check if already verified
        if otp_doc.get("isVerified"):
            raise bad_request("OTP đã được sử dụng")
        
        # Check if expired
        if OTPModel.is_expired(otp_doc):
            raise bad_request("OTP đã hết hạn")
        
        # Mark as verified
        await collection.update_one(
            {"_id": otp_doc["_id"]},
            {
                "$set": {
                    "isVerified": True,
                    "verifiedAt": datetime.utcnow()
                }
            }
        )
        
        return True
    
    @staticmethod
    async def get_latest_otp(phone: str, otp_type: OTPType) -> dict:
        """
        Get the latest OTP for a phone number
        
        Args:
            phone: User's phone number
            otp_type: Type of OTP
            
        Returns:
            Latest OTP document or None
        """
        collection = get_otps_collection()
        
        otp_doc = await collection.find_one(
            {
                "phone": phone,
                "type": otp_type.value
            },
            sort=[("createdAt", -1)]
        )
        
        return otp_doc
    
    @staticmethod
    async def check_otp_verified(phone: str, otp_type: OTPType) -> bool:
        """
        Check if a phone number has a verified OTP
        
        Args:
            phone: User's phone number
            otp_type: Type of OTP
            
        Returns:
            True if there's a verified OTP
        """
        collection = get_otps_collection()
        
        otp_doc = await collection.find_one({
            "phone": phone,
            "type": otp_type.value,
            "isVerified": True
        })
        
        # Check if verified and not expired
        if otp_doc and not OTPModel.is_expired(otp_doc):
            return True
        
        return False
    
    @staticmethod
    async def delete_otp(phone: str, otp_type: OTPType):
        """
        Delete OTP after use
        
        Args:
            phone: User's phone number
            otp_type: Type of OTP
        """
        collection = get_otps_collection()
        
        await collection.delete_many({
            "phone": phone,
            "type": otp_type.value
        })

