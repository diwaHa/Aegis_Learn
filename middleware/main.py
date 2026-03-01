from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Multi-Mode AI Middleware",
    description="Privacy-aware, structured, cost-optimized AI platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from middleware.core.auth import verify_token, create_token
from middleware.router import route_request

class ChatRequest(BaseModel):
    mode: str  # 'general', 'code', 'study'
    message: str
    session_id: Optional[str] = "default_session"
    industry: Optional[str] = "general"  # healthcare | finance | legal | general

class TokenRequest(BaseModel):
    user_id: str

@app.get("/")
async def root():
    return {"message": "Multi-Mode AI Middleware is running", "version": "1.0.0"}

@app.post("/auth/token")
async def get_token(request: TokenRequest):
    """Issues a JWT. In production, validate credentials before issuing."""
    token = create_token(request.user_id)
    return {"access_token": token, "token_type": "bearer"}

@app.post("/chat")
async def chat(request: ChatRequest, user_id: str = Depends(verify_token)):
    logger.info(f"[{user_id}] mode={request.mode} industry={request.industry}")
    try:
        response = await route_request(
            request.mode, request.message, request.session_id, request.industry
        )
        return {"status": "success", "data": response}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error processing request: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/audit-logs", dependencies=[Depends(verify_token)])
async def get_audit_logs():
    from middleware.modes.general_mode import _audit_logger
    return {"logs": _audit_logger.get_logs()}

@app.get("/cache-stats")
async def get_cache_stats():
    from middleware.core.cache import cache
    return {"cache_stats": cache.stats()}

@app.delete("/session/{session_id}", dependencies=[Depends(verify_token)])
async def clear_session(session_id: str):
    from middleware.core.cache import context_manager
    context_manager.clear(session_id)
    return {"message": f"Session {session_id} cleared"}

# ── Google Classroom & Reminder Routes ─────────────────────────────────────────

@app.get("/auth/login/{user_id}")
async def google_login(user_id: str):
    from middleware.core.classroom import get_oauth_url
    return {"oauth_url": get_oauth_url(), "user_id": user_id}

@app.get("/auth/callback")
async def oauth_callback(code: str, user_id: str = "default_user"):
    from middleware.core.classroom import exchange_code_for_token
    token = exchange_code_for_token(code, user_id)
    return {"status": "authenticated", "user_id": user_id, "expires_at": token["expires_at"]}

@app.get("/classroom/courses/{user_id}", dependencies=[Depends(verify_token)])
async def get_courses(user_id: str):
    from middleware.core.classroom import fetch_courses
    try:
        return {"courses": fetch_courses(user_id)}
    except PermissionError as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.get("/classroom/assignments/{user_id}", dependencies=[Depends(verify_token)])
async def get_assignments(user_id: str):
    from middleware.core.classroom import fetch_assignments
    try:
        return {"assignments": fetch_assignments(user_id)}
    except PermissionError as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.get("/reminders/{user_id}", dependencies=[Depends(verify_token)])
async def get_reminders(user_id: str):
    from middleware.core.classroom import check_deadlines, get_reminder_log
    upcoming = check_deadlines(user_id)
    return {"upcoming_reminders": upcoming, "all_reminders_sent": get_reminder_log(user_id)}

# ── Monitoring Dashboard ────────────────────────────────────────────────────────

@app.get("/dashboard/summary", dependencies=[Depends(verify_token)])
async def dashboard_summary():
    from middleware.core.dashboard import get_summary
    return get_summary()

@app.get("/dashboard/risk-heatmap", dependencies=[Depends(verify_token)])
async def dashboard_risk_heatmap():
    from middleware.core.dashboard import get_risk_heatmap
    return get_risk_heatmap()

@app.get("/dashboard/token-usage", dependencies=[Depends(verify_token)])
async def dashboard_token_usage():
    from middleware.core.dashboard import get_token_usage
    return get_token_usage()

@app.get("/dashboard/assignments/{user_id}", dependencies=[Depends(verify_token)])
async def dashboard_assignments(user_id: str):
    from middleware.core.dashboard import get_assignment_tracker
    return get_assignment_tracker(user_id)

@app.get("/dashboard/audit-export", dependencies=[Depends(verify_token)])
async def dashboard_audit_export():
    from middleware.core.dashboard import get_encrypted_audit_export
    return get_encrypted_audit_export()

# ── Scheduler Lifecycle ────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    from middleware.core.classroom import scheduler
    if scheduler:
        scheduler.start()
        logger.info("[Scheduler] Background deadline checker started.")

@app.on_event("shutdown")
async def shutdown_event():
    from middleware.core.classroom import scheduler
    if scheduler and scheduler.running:
        scheduler.shutdown()
        logger.info("[Scheduler] Background deadline checker stopped.")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
