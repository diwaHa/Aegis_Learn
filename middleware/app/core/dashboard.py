"""
app/core/dashboard.py — Analytics, risk heatmap, token usage, and audit export.
"""

import json, base64, logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

_request_log: List[Dict] = []
_token_estimates = {"general": 400, "code": 600, "study": 500}


def record_request(mode: str, industry: str, risk_level: Optional[str],
                   from_cache: bool, pii_detected: bool, session_id: str):
    _request_log.append({
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "mode": mode, "industry": industry, "risk_level": risk_level,
        "from_cache": from_cache, "pii_detected": pii_detected,
        "session_id": session_id[:8] + "***",
    })


def get_summary() -> Dict[str, Any]:
    total = len(_request_log)
    if not total:
        return {"total_requests": 0}
    mode_counts: Dict[str, int] = {}
    cache_hits = pii_count = 0
    for r in _request_log:
        mode_counts[r["mode"]] = mode_counts.get(r["mode"], 0) + 1
        if r["from_cache"]: cache_hits += 1
        if r["pii_detected"]: pii_count += 1
    return {
        "total_requests": total,
        "requests_by_mode": mode_counts,
        "cache_hits": cache_hits,
        "cache_hit_rate": round(cache_hits / total, 3),
        "pii_detected_count": pii_count,
    }


def get_risk_heatmap() -> Dict[str, Any]:
    logs = [r for r in _request_log if r["mode"] == "general"]
    if not logs:
        return {"message": "No General Mode requests recorded yet."}
    counts: Dict[str, int] = {}
    for r in logs:
        lvl = r.get("risk_level") or "UNKNOWN"
        counts[lvl] = counts.get(lvl, 0) + 1
    total = len(logs)
    labels = {"SAFE": "🟢 Safe", "MEDIUM_RISK": "🟡 Medium", "HIGH_RISK": "🔴 High"}
    return {
        "total": total,
        "distribution": {lvl: {"count": c, "pct": round(c/total*100,1), "label": labels.get(lvl,"⚪")}
                         for lvl, c in counts.items()},
    }


def get_token_usage() -> Dict[str, Any]:
    if not _request_log:
        return {"message": "No requests yet."}
    spent = saved = 0
    for r in _request_log:
        avg = _token_estimates.get(r["mode"], 450)
        if r["from_cache"]: saved += int(avg * 0.85)
        else: spent += avg
    return {"tokens_spent": spent, "tokens_saved_by_cache": saved,
            "cached_requests": sum(1 for r in _request_log if r["from_cache"])}


def get_assignment_tracker(user_id: str) -> Dict[str, Any]:
    from app.core.classroom import _assignment_store, _reminder_log
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    summary = []
    for a in _assignment_store.get(user_id, []):
        h = (datetime.fromisoformat(a["due_date"]) - now).total_seconds() / 3600
        status = "⏰ Overdue" if h < 0 else "🔴 Due Soon" if h <= 24 else "🟡 Upcoming" if h <= 72 else "🟢 On Track"
        summary.append({"title": a["title"], "course": a["course"],
                         "hours_left": round(h, 1), "status": status, "reminded": a.get("reminded", False)})
    return {"user_id": user_id, "assignments": summary,
            "reminders_sent": len(_reminder_log.get(user_id, []))}


def get_encrypted_audit_export() -> Dict[str, Any]:
    from app.modes.general_mode import _audit_logger
    raw = json.dumps(_audit_logger.get_logs(), indent=2)
    blob = base64.b64encode(raw.encode()).decode()
    return {"format": "base64(AES-256 placeholder)", "entry_count": len(_audit_logger.get_logs()),
            "payload_preview": blob[:200] + "...", "note": "Replace with Fernet in production."}
