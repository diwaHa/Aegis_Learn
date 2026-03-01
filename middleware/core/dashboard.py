"""
Phase 6: Monitoring Dashboard — Analytics, Risk Heatmap, Audit Logging

Provides a set of endpoints that give a full operational view into the platform:
  GET /dashboard/summary        — Global request stats across all modes
  GET /dashboard/risk-heatmap   — Breakdown of risk levels seen in General Mode
  GET /dashboard/token-usage    — Cache efficiency + estimated token savings
  GET /dashboard/assignments/{user_id} — Assignment completion tracker
  GET /dashboard/audit-export   — Encrypted-ready audit log export
"""

import json
import base64
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

# ── In-memory global analytics store ──────────────────────────────────────────

_request_log: List[Dict] = []   # One entry per /chat call


def record_request(
    mode: str,
    industry: str,
    risk_level: Optional[str],
    from_cache: bool,
    pii_detected: bool,
    session_id: str,
):
    """Called by each mode handler to record a request event."""
    _request_log.append({
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "mode": mode,
        "industry": industry,
        "risk_level": risk_level,          # None for code / study modes
        "from_cache": from_cache,
        "pii_detected": pii_detected,
        "session_id": session_id[:8] + "***",  # partial mask
    })


# ── 1. Summary ─────────────────────────────────────────────────────────────────

def get_summary() -> Dict[str, Any]:
    total = len(_request_log)
    if total == 0:
        return {"total_requests": 0}

    mode_counts = {}
    cache_hits = sum(1 for r in _request_log if r["from_cache"])
    pii_requests = sum(1 for r in _request_log if r["pii_detected"])

    for r in _request_log:
        mode_counts[r["mode"]] = mode_counts.get(r["mode"], 0) + 1

    return {
        "total_requests": total,
        "requests_by_mode": mode_counts,
        "cache_hits": cache_hits,
        "cache_hit_rate": round(cache_hits / total, 3),
        "pii_detected_count": pii_requests,
        "pii_detection_rate": round(pii_requests / total, 3),
    }


# ── 2. Risk Heatmap ────────────────────────────────────────────────────────────

def get_risk_heatmap() -> Dict[str, Any]:
    general_logs = [r for r in _request_log if r["mode"] == "general"]
    if not general_logs:
        return {"message": "No General Mode requests recorded yet."}

    level_counts: Dict[str, int] = {}
    for r in general_logs:
        lvl = r.get("risk_level") or "UNKNOWN"
        level_counts[lvl] = level_counts.get(lvl, 0) + 1

    total = len(general_logs)
    return {
        "total_general_requests": total,
        "risk_distribution": {
            lvl: {
                "count": cnt,
                "percentage": round(cnt / total * 100, 1),
                "display": {
                    "SAFE": "🟢 Safe",
                    "MEDIUM_RISK": "🟡 Medium Risk",
                    "HIGH_RISK": "🔴 High Risk",
                }.get(lvl, "⚪ Unknown"),
            }
            for lvl, cnt in level_counts.items()
        },
    }


# ── 3. Token Usage / Cache Efficiency ─────────────────────────────────────────

# Rough token cost estimates per mode (avg prompt + response)
_token_estimates = {"general": 400, "code": 600, "study": 500}
_avg_cache_saving_factor = 0.85   # a cached response saves ~85% of LLM tokens


def get_token_usage() -> Dict[str, Any]:
    if not _request_log:
        return {"message": "No requests recorded yet."}

    total_tokens_spent = 0
    total_tokens_saved = 0

    for r in _request_log:
        avg = _token_estimates.get(r["mode"], 450)
        if r["from_cache"]:
            total_tokens_saved += int(avg * _avg_cache_saving_factor)
        else:
            total_tokens_spent += avg

    return {
        "tokens_spent_estimate": total_tokens_spent,
        "tokens_saved_by_cache": total_tokens_saved,
        "total_requests": len(_request_log),
        "cached_requests": sum(1 for r in _request_log if r["from_cache"]),
    }


# ── 4. Assignment Tracker ──────────────────────────────────────────────────────

def get_assignment_tracker(user_id: str) -> Dict[str, Any]:
    """Summarises assignment status for a given user."""
    from core.classroom import _assignment_store, _reminder_log

    assignments = _assignment_store.get(user_id, [])
    now = datetime.now(timezone.utc)

    summary = []
    for a in assignments:
        due = datetime.fromisoformat(a["due_date"])
        hours_left = (due - now).total_seconds() / 3600
        status = (
            "⏰ Overdue" if hours_left < 0 else
            "🔴 Due Soon" if hours_left <= 24 else
            "🟡 Upcoming" if hours_left <= 72 else
            "🟢 On Track"
        )
        summary.append({
            "title": a["title"],
            "course": a["course"],
            "due_in_hours": round(hours_left, 1),
            "status": status,
            "reminded": a.get("reminded", False),
        })

    return {
        "user_id": user_id,
        "assignments": summary,
        "reminders_sent": len(_reminder_log.get(user_id, [])),
    }


# ── 5. Encrypted Audit Export ──────────────────────────────────────────────────

def _pseudo_encrypt(data: str) -> str:
    """
    Base64 encoding as a stand-in for AES-256 encryption.
    In production: use `cryptography` library with Fernet or AES-GCM.
    """
    return base64.b64encode(data.encode()).decode()


def get_encrypted_audit_export() -> Dict[str, Any]:
    from modes.general_mode import _audit_logger
    raw = json.dumps(_audit_logger.get_logs(), indent=2)
    encrypted_blob = _pseudo_encrypt(raw)
    return {
        "format": "base64(AES-256 placeholder)",
        "entry_count": len(_audit_logger.get_logs()),
        "encrypted_payload": encrypted_blob[:200] + "...[truncated]",
        "note": "Replace _pseudo_encrypt() with Fernet/AES-GCM for production.",
    }
