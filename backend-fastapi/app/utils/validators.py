"""
Validation utilities
"""
import re
from email_validator import validate_email, EmailNotValidError


def validate_phone_format(phone: str) -> bool:
    """
    Validate Vietnamese phone number format (E.164)
    
    Args:
        phone: Phone number to validate
        
    Returns:
        True if valid, False otherwise
    
    Examples:
        +84397912441 ✅
        +849123456789 ✅
        84397912441 ❌
        0397912441 ❌
    """
    pattern = r'^\+84\d{9,10}$'
    return bool(re.match(pattern, phone))


def validate_email_format(email: str) -> bool:
    """
    Validate email format
    
    Args:
        email: Email address to validate
        
    Returns:
        True if valid, False otherwise
    """
    try:
        validate_email(email)
        return True
    except EmailNotValidError:
        return False


def normalize_phone(phone: str) -> str:
    """
    Normalize phone number to E.164 format
    
    Args:
        phone: Phone number (can be in various formats)
        
    Returns:
        Normalized phone number in E.164 format
        
    Examples:
        0397912441 -> +84397912441
        84397912441 -> +84397912441
        +84397912441 -> +84397912441
    """
    # Remove all non-digit characters except +
    cleaned = re.sub(r'[^\d+]', '', phone)
    
    # Handle different formats
    if cleaned.startswith('+84'):
        return cleaned
    elif cleaned.startswith('84'):
        return '+' + cleaned
    elif cleaned.startswith('0'):
        return '+84' + cleaned[1:]
    else:
        return '+84' + cleaned

