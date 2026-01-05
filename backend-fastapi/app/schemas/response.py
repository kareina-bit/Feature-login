"""
Generic Response Schemas
"""
from typing import Any, Optional, Generic, TypeVar
from pydantic import BaseModel


DataT = TypeVar('DataT')


class SuccessResponse(BaseModel, Generic[DataT]):
    """Generic success response"""
    success: bool = True
    message: str
    data: Optional[DataT] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Operation successful",
                "data": {}
            }
        }


class ErrorResponse(BaseModel):
    """Generic error response"""
    success: bool = False
    message: str
    error: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": False,
                "message": "Operation failed",
                "error": "Detailed error message"
            }
        }


class PaginatedResponse(BaseModel, Generic[DataT]):
    """Paginated response"""
    success: bool = True
    message: str
    data: list[DataT]
    pagination: dict
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Data retrieved successfully",
                "data": [],
                "pagination": {
                    "page": 1,
                    "limit": 10,
                    "total": 100,
                    "pages": 10
                }
            }
        }

