"""
app/api/dashboard.py — Monitoring, analytics, and audit export endpoints.
All routes require JWT authentication.
"""

from fastapi import APIRouter, Depends
from app.core.security import verify_token

router = APIRouter(prefix="/dashboard", tags=["Monitoring Dashboard"])
_dep = [Depends(verify_token)]


@router.get("/summary", dependencies=_dep, summary="Global request stats across all modes")
async def summary():
    from app.core.dashboard import get_summary
    return get_summary()


@router.get("/risk-heatmap", dependencies=_dep, summary="Privacy risk distribution for General Mode")
async def risk_heatmap():
    from app.core.dashboard import get_risk_heatmap
    return get_risk_heatmap()


@router.get("/token-usage", dependencies=_dep, summary="Estimated tokens spent vs. saved by cache")
async def token_usage():
    from app.core.dashboard import get_token_usage
    return get_token_usage()


@router.get("/assignments/{user_id}", dependencies=_dep, summary="Assignment completion tracker")
async def assignments(user_id: str):
    from app.core.dashboard import get_assignment_tracker
    return get_assignment_tracker(user_id)


@router.get("/audit-export", dependencies=_dep, summary="Encrypted audit log export")
async def audit_export():
    from app.core.dashboard import get_encrypted_audit_export
    return get_encrypted_audit_export()


@router.get("/audit-logs", dependencies=_dep, summary="Raw audit log entries")
async def audit_logs():
    from app.modes.general_mode import _audit_logger
    return {"logs": _audit_logger.get_logs()}
