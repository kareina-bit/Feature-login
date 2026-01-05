"""
Core module: Configuration, Security, Database, Exceptions
"""
from app.core.config import settings
from app.core.database import (
    connect_db,
    close_db,
    get_database,
    get_users_collection,
    get_otps_collection,
)
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)
from app.core.exceptions import (
    AppException,
    NotFoundException,
    UnauthorizedException,
    BadRequestException,
    ConflictException,
    ValidationException,
    not_found,
    unauthorized,
    bad_request,
    conflict,
    validation_error,
)

__all__ = [
    # Config
    "settings",
    # Database
    "connect_db",
    "close_db",
    "get_database",
    "get_users_collection",
    "get_otps_collection",
    # Security
    "hash_password",
    "verify_password",
    "create_access_token",
    "decode_access_token",
    # Exceptions
    "AppException",
    "NotFoundException",
    "UnauthorizedException",
    "BadRequestException",
    "ConflictException",
    "ValidationException",
    "not_found",
    "unauthorized",
    "bad_request",
    "conflict",
    "validation_error",
]
