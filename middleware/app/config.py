"""
app/config.py — Centralized settings loaded from middleware/.env
All services read from this single source of truth.
"""

import os
from dotenv import load_dotenv

# Load .env from the middleware/ directory (one level up from app/)
_env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(dotenv_path=_env_path)

class Settings:
    # ── LLM ──────────────────────────────────────────────────────────────────
    GEMINI_API_KEY: str  = os.getenv("GEMINI_API_KEY", "")
    LITELLM_MODEL: str   = os.getenv("LITELLM_MODEL", "gemini-2.0-flash")

    # ── Auth ──────────────────────────────────────────────────────────────────
    JWT_SECRET: str      = os.getenv("JWT_SECRET", "CHANGE_ME_IN_PRODUCTION_USE_LONG_RANDOM_STRING")
    JWT_ALGORITHM: str   = "HS256"
    JWT_EXPIRY_HOURS: int = 24

    # ── Cache / Redis ─────────────────────────────────────────────────────────
    REDIS_URL: str       = os.getenv("REDIS_URL", "redis://localhost:6379")
    CACHE_TTL: int       = 3600
    SIMILARITY_THRESHOLD: float = 0.82
    MAX_CONTEXT_TURNS: int = 3

    # ── Database / MongoDB ────────────────────────────────────────────────────
    MONGODB_URI: str     = os.getenv("MONGODB_URI", "")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "ai_middleware_db")

    # ── Encryption ────────────────────────────────────────────────────────────
    FERNET_KEY: str      = os.getenv("FERNET_KEY", "")

    # ── Google Classroom ──────────────────────────────────────────────────────
    GOOGLE_CLIENT_ID: str     = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI: str  = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/callback")

    # ── App ───────────────────────────────────────────────────────────────────
    APP_HOST: str        = os.getenv("APP_HOST", "0.0.0.0")
    APP_PORT: int        = int(os.getenv("APP_PORT", "8000"))
    DEBUG: bool          = os.getenv("DEBUG", "false").lower() == "true"

settings = Settings()
