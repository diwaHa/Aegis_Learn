"""
app/models/requests.py — API request and response Pydantic models.
All endpoint input/output schemas live here.
"""

from pydantic import BaseModel
from typing import Optional, Literal


class ChatRequest(BaseModel):
    """Main chat endpoint payload."""
    mode: Literal["general", "code", "study"]
    message: str
    session_id: Optional[str] = "default_session"
    industry: Optional[Literal["general", "healthcare", "finance", "legal"]] = "general"

    class Config:
        json_schema_extra = {
            "example": {
                "mode": "study",
                "message": "Explain CNNs for 13 marks",
                "session_id": "student_001",
                "industry": "general"
            }
        }


class TokenRequest(BaseModel):
    """Request body for JWT issuance."""
    user_id: str

    class Config:
        json_schema_extra = {"example": {"user_id": "student_42"}}


class ChatResponse(BaseModel):
    """Standard API response wrapper."""
    status: Literal["success", "error"]
    data: Optional[dict] = None
    error: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
