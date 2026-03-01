"""
app/core/security.py — JWT authentication helpers.
Renamed from auth.py for clarity (security = broader concern).
"""

import logging
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings

logger = logging.getLogger(__name__)

try:
    import jwt as pyjwt
    _JWT_AVAILABLE = True
except ImportError:
    _JWT_AVAILABLE = False
    logger.warning("[Auth] PyJWT not installed. Run: pip install PyJWT")

_bearer = HTTPBearer(auto_error=False)
_DEV_MODE = settings.JWT_SECRET == "CHANGE_ME_IN_PRODUCTION_USE_LONG_RANDOM_STRING"


def create_token(user_id: str) -> str:
    if not _JWT_AVAILABLE:
        return f"stub_token_{user_id}"
    payload = {
        "sub": user_id,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=settings.JWT_EXPIRY_HOURS),
    }
    return pyjwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def verify_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(_bearer),
) -> str:
    """FastAPI dependency — returns user_id or raises 401."""
    if _DEV_MODE:
        logger.debug("[Auth] Dev mode — JWT verification skipped.")
        return "dev_user"
    if credentials is None:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    if not _JWT_AVAILABLE:
        return credentials.credentials
    try:
        payload = pyjwt.decode(
            credentials.credentials, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload["sub"]
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except pyjwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")
