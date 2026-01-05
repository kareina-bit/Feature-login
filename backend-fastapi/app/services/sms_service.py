"""
SMS Service - SMS/Twilio integration
"""
from typing import Optional
from app.core.config import settings


class SMSService:
    """SMS service for sending OTP via Twilio"""
    
    def __init__(self):
        self.twilio_configured = False
        self.client = None
        
        # Initialize Twilio if configured
        if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
            try:
                from twilio.rest import Client
                self.client = Client(
                    settings.TWILIO_ACCOUNT_SID,
                    settings.TWILIO_AUTH_TOKEN
                )
                self.twilio_configured = True
            except ImportError:
                print("⚠️  Twilio library not installed. SMS will be simulated.")
            except Exception as e:
                print(f"⚠️  Twilio initialization failed: {e}")
    
    async def send_otp(self, phone: str, code: str, otp_type: str) -> bool:
        """
        Send OTP via SMS
        
        Args:
            phone: Recipient's phone number
            code: OTP code to send
            otp_type: Type of OTP (registration, reset-password)
            
        Returns:
            True if sent successfully
        """
        # Format message based on type
        if otp_type == "registration":
            message = f"Shipway - Mã xác thực đăng ký của bạn là: {code}. Có hiệu lực trong 5 phút."
        elif otp_type == "reset-password":
            message = f"Shipway - Mã xác thực đặt lại mật khẩu của bạn là: {code}. Có hiệu lực trong 5 phút."
        else:
            message = f"Shipway - Mã xác thực của bạn là: {code}"
        
        if self.twilio_configured and self.client:
            try:
                # Send via Twilio
                self.client.messages.create(
                    body=message,
                    from_=settings.TWILIO_PHONE_NUMBER,
                    to=phone
                )
                print(f"📱 SMS sent to {phone}")
                return True
            except Exception as e:
                print(f"❌ Failed to send SMS: {e}")
                # Fall back to console logging
                print(f"⚠️  OTP for {phone} ({otp_type}): {code}")
                return False
        else:
            # Development mode - log to console
            print(f"⚠️  Twilio not configured. OTP: {code}")
            print(f"📱 OTP created for {phone} ({otp_type}): {code}")
            return True
    
    async def send_sms(self, phone: str, message: str) -> bool:
        """
        Send a generic SMS message
        
        Args:
            phone: Recipient's phone number
            message: Message to send
            
        Returns:
            True if sent successfully
        """
        if self.twilio_configured and self.client:
            try:
                self.client.messages.create(
                    body=message,
                    from_=settings.TWILIO_PHONE_NUMBER,
                    to=phone
                )
                print(f"📱 SMS sent to {phone}")
                return True
            except Exception as e:
                print(f"❌ Failed to send SMS: {e}")
                return False
        else:
            # Development mode - log to console
            print(f"📱 SMS to {phone}: {message}")
            return True


# Singleton instance
sms_service = SMSService()

