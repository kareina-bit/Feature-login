"""
Helper utilities
"""
import random
import string
from datetime import datetime


def generate_otp(length: int = 6) -> str:
    """
    Generate a random OTP code
    
    Args:
        length: Length of OTP (default: 6)
        
    Returns:
        Random numeric OTP code
    """
    return ''.join(random.choices(string.digits, k=length))


def format_datetime(dt: datetime) -> str:
    """
    Format datetime to ISO 8601 string
    
    Args:
        dt: Datetime object
        
    Returns:
        ISO 8601 formatted string
    """
    if not dt:
        return None
    return dt.isoformat() + 'Z'


def mask_phone(phone: str) -> str:
    """
    Mask phone number for privacy
    
    Args:
        phone: Phone number
        
    Returns:
        Masked phone number
        
    Example:
        +84397912441 -> +84****2441
    """
    if len(phone) < 8:
        return phone
    
    return phone[:4] + '****' + phone[-4:]


def mask_email(email: str) -> str:
    """
    Mask email address for privacy
    
    Args:
        email: Email address
        
    Returns:
        Masked email address
        
    Example:
        user@example.com -> u***@example.com
    """
    if '@' not in email:
        return email
    
    local, domain = email.split('@', 1)
    if len(local) <= 1:
        return email
    
    return local[0] + '***@' + domain

