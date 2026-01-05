"""
Configuration settings
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "Shipway API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    PORT: int = 5000
    
    # MongoDB
    MONGODB_URI: str
    DATABASE_NAME: str = "shipway"
    
    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 10080  # 7 days
    
    # OTP
    OTP_EXPIRE_MINUTES: int = 5
    
    # Twilio (Optional)
    TWILIO_ACCOUNT_SID: str | None = None
    TWILIO_AUTH_TOKEN: str | None = None
    TWILIO_PHONE_NUMBER: str | None = None
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5500",
        "http://localhost:5501",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5500",
        "http://127.0.0.1:5501",
    ]
    
    # Admin Default
    ADMIN_PHONE: str = "+84391912441"
    ADMIN_PASSWORD: str = "Admin@123456"
    ADMIN_NAME: str = "Shipway Administrator"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

