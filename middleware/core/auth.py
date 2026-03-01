"""
middleware/core/auth.py — JWT Authentication Middleware
Protects all /chat and /dashboard/* routes.
"""

import os
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

logger = logging.getLogger(__name__)

JWT_SECRET = os.getenv("JWT_SECRET", "CHANGE_ME_IN_PRODUCTION_USE_LONG_RANDOM_STRING")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24

try:
    import jwt as pyjwt
    _JWT_AVAILABLE = True
except ImportError:
    _JWT_AVAILABLE = False
    logger.warning("[Auth] PyJWT not installed. Run: pip install PyJWT")

_security = HTTPBearer(auto_error=False)


def create_token(user_id: str) -> str:
    """Creates a signed JWT token for the given user_id."""
    if not _JWT_AVAILABLE:
        return f"stub_token_{user_id}"
    payload = {
        "sub": user_id,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS),
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(credentials: Optional[HTTPAuthorizationCredentials] = Security(_security)) -> str:
    """
    FastAPI dependency. Verifies the Bearer token and returns the user_id.
    If JWT is not configured and we're in development, allows all requests.
    """
    # Dev mode: skip auth if JWT_SECRET is the default placeholder
    if JWT_SECRET == "CHANGE_ME_IN_PRODUCTION_USE_LONG_RANDOM_STRING":
        return "dev_user"

    if credentials is None:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    if not _JWT_AVAILABLE:
        return credentials.credentials  # Trust token string as user_id in stub mode

    try:
        payload = pyjwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload["sub"]
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except pyjwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")
