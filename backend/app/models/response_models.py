from typing import List, Dict, Any, Optional, Literal, TypeVar, Generic
from pydantic import BaseModel, Field
from typing_extensions import TypedDict

class ColumnDefinition(TypedDict):
    """Definition for a column in the response."""
    key: str
    label: str
    type: Literal["string", "number", "percent", "currency"]
    unit: Optional[str] = None

class TableResponse(BaseModel):
    """Standard response format for tabular data."""
    status: Literal["success", "error"] = "success"
    data: List[Dict[str, Any]] = []
    meta: Optional[Dict[str, Any]] = None

class TableResponseWithMeta(TableResponse):
    """Table response with column metadata."""
    meta: Dict[str, Any] = Field(default_factory=dict)
    
    @classmethod
    def with_columns(
        cls, 
        data: List[Dict[str, Any]], 
        columns: List[ColumnDefinition],
        **meta
    ) -> 'TableResponseWithMeta':
        """Helper to create a response with column definitions."""
        return cls(
            status="success",
            data=data,
            meta={
                "columns": columns,
                **meta
            }
        )

class ErrorResponse(BaseModel):
    """Standard error response format."""
    status: Literal["error"] = "error"
    error: str
    details: Optional[Dict[str, Any]] = None

# Generic response type for endpoints with multiple tables
class MultiTableResponse(BaseModel):
    """Response format for endpoints returning multiple tables."""
    status: Literal["success", "error"] = "success"
    errors: Dict[str, str] = {}
    
    def __getitem__(self, key: str) -> TableResponse:
        return getattr(self, key)

# Example usage:
# class MarketDepthResponse(MultiTableResponse):
#     highpower: TableResponse
#     intradayBoost: TableResponse
#     topLevel: TableResponse
#     lowLevel: TableResponse
#     gainers: TableResponse
#     losers: TableResponse
