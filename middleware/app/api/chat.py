"""
app/api/chat.py — Core chat endpoint.
Receives all user messages and dispatches to the correct mode handler
via the router layer.
"""

from fastapi import APIRouter, Depends, HTTPException
from app.models.requests import ChatRequest, ChatResponse
from app.core.security import verify_token
from app.router import route_request
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post(
    "",
    response_model=ChatResponse,
    summary="Send a message to the AI middleware",
    description=(
        "Route a message to one of three AI modes:\n"
        "- **general** — Privacy-first LLM with PII redaction\n"
        "- **study** — Structured academic output (schemas enforced)\n"
        "- **code** — A2UI protocol responses for UI generation"
    )
)
async def chat(request: ChatRequest, user_id: str = Depends(verify_token)):
    logger.info(f"[{user_id}] mode={request.mode} industry={request.industry}")
    try:
        response = await route_request(
            request.mode, request.message, request.session_id, request.industry
        )
        return ChatResponse(status="success", data=response)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Internal error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
