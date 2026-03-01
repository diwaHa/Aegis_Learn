"""
app/core/classroom.py — Google Classroom API integration + smart reminder engine.
"""

import os, logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional
from app.config import settings

logger = logging.getLogger(__name__)

_token_store: Dict[str, Dict] = {}
_assignment_store: Dict[str, List[Dict]] = {}
_reminder_log: Dict[str, List[Dict]] = {}

SCOPES = [
    "https://www.googleapis.com/auth/classroom.courses.readonly",
    "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
]


def get_oauth_url() -> str:
    scope_str = " ".join(SCOPES)
    return (
        f"https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={settings.GOOGLE_CLIENT_ID}"
        f"&redirect_uri={settings.GOOGLE_REDIRECT_URI}"
        f"&response_type=code&scope={scope_str}"
        f"&access_type=offline&prompt=consent"
    )


def exchange_code_for_token(code: str, user_id: str) -> Dict:
    logger.info(f"[Classroom] Exchanging OAuth code for user={user_id} (stub)")
    token = {
        "access_token": f"mock_access_{user_id}",
        "refresh_token": f"mock_refresh_{user_id}",
        "expires_at": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
    }
    _token_store[user_id] = token
    return token


def get_token(user_id: str) -> Optional[Dict]:
    return _token_store.get(user_id)


def fetch_courses(user_id: str) -> List[Dict]:
    if not get_token(user_id):
        raise PermissionError(f"User '{user_id}' is not authenticated. Call /auth/login first.")
    return [
        {"id": "c001", "name": "Artificial Intelligence", "section": "A"},
        {"id": "c002", "name": "Data Structures", "section": "B"},
        {"id": "c003", "name": "Operating Systems", "section": "A"},
    ]


def fetch_assignments(user_id: str) -> List[Dict]:
    if not get_token(user_id):
        raise PermissionError(f"User '{user_id}' is not authenticated. Call /auth/login first.")
    now = datetime.now(timezone.utc)
    assignments = [
        {"id": "a001", "course": "Artificial Intelligence", "title": "Lab Record – Neural Networks",
         "due_date": (now + timedelta(hours=36)).isoformat()},
        {"id": "a002", "course": "Data Structures", "title": "Assignment 3 – AVL Trees",
         "due_date": (now + timedelta(days=5)).isoformat()},
        {"id": "a003", "course": "Operating Systems", "title": "Mini Project – Scheduler",
         "due_date": (now + timedelta(days=10)).isoformat()},
    ]
    _assignment_store[user_id] = assignments
    return assignments


def check_deadlines(user_id: str) -> List[Dict]:
    now = datetime.now(timezone.utc)
    upcoming = []
    for a in _assignment_store.get(user_id, []):
        hours_left = (datetime.fromisoformat(a["due_date"]) - now).total_seconds() / 3600
        if 0 < hours_left <= 48 and not a.get("reminded"):
            reminder = {
                "assignment_id": a["id"], "course": a["course"], "title": a["title"],
                "hours_left": round(hours_left, 1),
                "ai_offer": f"⚠️ '{a['title']}' due in {round(hours_left,1)}h. Ask Study Mode for help!",
            }
            upcoming.append(reminder)
            a["reminded"] = True
            _reminder_log.setdefault(user_id, []).append(reminder)
    return upcoming


def get_reminder_log(user_id: str) -> List[Dict]:
    return _reminder_log.get(user_id, [])


try:
    from apscheduler.schedulers.asyncio import AsyncIOScheduler
    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        lambda: [check_deadlines(uid) for uid in list(_token_store.keys())],
        trigger="interval", minutes=30, id="deadline_checker", replace_existing=True,
    )
except ImportError:
    scheduler = None
    logger.warning("[Scheduler] apscheduler not installed — reminders are on-demand only.")
