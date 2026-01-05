"""
Custom exceptions for the application
"""
from fastapi import HTTPException, status


class AppException(Exception):
    """Base application exception"""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class NotFoundException(AppException):
    """Resource not found exception"""
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status_code=404)


class UnauthorizedException(AppException):
    """Unauthorized access exception"""
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, status_code=401)


class BadRequestException(AppException):
    """Bad request exception"""
    def __init__(self, message: str = "Bad request"):
        super().__init__(message, status_code=400)


class ConflictException(AppException):
    """Conflict exception (e.g., duplicate resource)"""
    def __init__(self, message: str = "Resource already exists"):
        super().__init__(message, status_code=409)


class ValidationException(AppException):
    """Validation error exception"""
    def __init__(self, message: str = "Validation error"):
        super().__init__(message, status_code=422)


# HTTP Exception shortcuts
def not_found(message: str = "Resource not found"):
    """Raise 404 Not Found"""
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=message)


def unauthorized(message: str = "Unauthorized"):
    """Raise 401 Unauthorized"""
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=message)


def bad_request(message: str = "Bad request"):
    """Raise 400 Bad Request"""
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)


def conflict(message: str = "Resource already exists"):
    """Raise 409 Conflict"""
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=message)


def validation_error(message: str = "Validation error"):
    """Raise 422 Validation Error"""
    raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=message)

