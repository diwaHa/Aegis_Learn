"""
app/api/auth.py — Authentication and session management endpoints.
Handles JWT issuance, Google OAuth flow, and session cleanup.
"""

from fastapi import APIRouter, Depends, HTTPException
from app.models.requests import TokenRequest, TokenResponse
from app.core.security import verify_token, create_token
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/token", response_model=TokenResponse, summary="Issue a JWT access token")
async def get_token(request: TokenRequest):
    """
    Issues a signed JWT for the given user_id.
    In production, validate credentials (password/OAuth) before calling this.
    """
    token = create_token(request.user_id)
    return TokenResponse(access_token=token)


@router.get("/login/{user_id}", summary="Get Google OAuth consent URL")
async def google_login(user_id: str):
    """Returns the URL the user should visit to authorise Google Classroom access."""
    from app.core.classroom import get_oauth_url
    return {"oauth_url": get_oauth_url(), "user_id": user_id}


@router.get("/callback", summary="Google OAuth callback — exchange code for token")
async def oauth_callback(code: str, user_id: str = "default_user"):
    from app.core.classroom import exchange_code_for_token
    token = exchange_code_for_token(code, user_id)
    return {"status": "authenticated", "user_id": user_id, "expires_at": token["expires_at"]}


@router.delete(
    "/session/{session_id}",
    dependencies=[Depends(verify_token)],
    summary="Clear conversation history for a session"
)
async def clear_session(session_id: str):
    from app.core.cache import context_manager
    context_manager.clear(session_id)
    return {"message": f"Session '{session_id}' cleared"}
