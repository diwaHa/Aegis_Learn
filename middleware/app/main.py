"""
app/main.py — FastAPI application entry point.

Run from inside middleware/ directory:
    uvicorn app.main:app --reload
    python -m app.main
"""

import logging
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api   import health, chat, auth, classroom, dashboard

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# ── App instance ───────────────────────────────────────────────────────────────
app = FastAPI(
    title       = "Multi-Mode AI Middleware",
    description = (
        "A privacy-aware, structured-output, cost-optimised AI gateway.\n\n"
        "**Modes:** `general` (privacy firewall) | `study` (academic schemas) | `code` (A2UI protocol)\n\n"
        "**Docs:** `/docs` (Swagger) · `/redoc` (ReDoc)"
    ),
    version     = "1.0.0",
    docs_url    = "/docs",
    redoc_url   = "/redoc",
)

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["*"],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(health.router)
app.include_router(chat.router)
app.include_router(auth.router)
app.include_router(classroom.router)
app.include_router(dashboard.router)

# ── Lifecycle ──────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def on_startup():
    from app.core.classroom import scheduler
    if scheduler:
        scheduler.start()
        logger.info("[Scheduler] Background deadline checker started (every 30 min).")

@app.on_event("shutdown")
async def on_shutdown():
    from app.core.classroom import scheduler
    if scheduler and scheduler.running:
        scheduler.shutdown()
        logger.info("[Scheduler] Stopped.")


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host    = settings.APP_HOST,
        port    = settings.APP_PORT,
        reload  = settings.DEBUG,
    )
