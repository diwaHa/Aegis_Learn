"""
Phase 5: Google Classroom Integration + Smart Reminder System

Flow:
  1.  User authenticates via OAuth 2.0 (Google)
  2.  Fetch courses + assignments from Google Classroom API
  3.  Store deadlines in local DB (dict-based; swap for MongoDB in production)
  4.  APScheduler polls every 30 min for upcoming deadlines
  5.  When a deadline is ≤ 48h away, fire a reminder with an AI-assist offer

To activate real Google API:
  - Create credentials via Google Cloud Console
  - Enable "Classroom API" + "Google OAuth2 API"
  - Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI in .env
"""

import os
import logging
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────────────────────
# In-memory stores (swap with MongoDB in production)
# ──────────────────────────────────────────────────────────────────────────────

# user_id → {access_token, refresh_token, expires_at}
_token_store: Dict[str, Dict] = {}

# user_id → [{course, assignment, due_date, reminded}]
_assignment_store: Dict[str, List[Dict]] = {}

# user_id → [reminder dicts]
_reminder_log: Dict[str, List[Dict]] = {}


# ──────────────────────────────────────────────────────────────────────────────
# 1. OAuth 2.0 Helpers
# ──────────────────────────────────────────────────────────────────────────────

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "YOUR_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "YOUR_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/callback")

SCOPES = [
    "https://www.googleapis.com/auth/classroom.courses.readonly",
    "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
]


def get_oauth_url() -> str:
    """
    Returns the Google OAuth consent URL.
    In production: use google-auth-oauthlib.flow.Flow.
    """
    scope_str = " ".join(SCOPES)
    return (
        f"https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
        f"&response_type=code"
        f"&scope={scope_str}"
        f"&access_type=offline"
        f"&prompt=consent"
    )


def exchange_code_for_token(code: str, user_id: str) -> Dict:
    """
    Exchanges an OAuth auth code for tokens.
    Stub: in production call https://oauth2.googleapis.com/token
    """
    logger.info(f"[OAuth] Exchanging code for user {user_id} (stub)")
    # Simulated token
    token = {
        "access_token": f"mock_access_token_{user_id}",
        "refresh_token": f"mock_refresh_token_{user_id}",
        "expires_at": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
    }
    _token_store[user_id] = token
    return token


def get_token(user_id: str) -> Optional[Dict]:
    return _token_store.get(user_id)


# ──────────────────────────────────────────────────────────────────────────────
# 2. Classroom API Wrapper
# ──────────────────────────────────────────────────────────────────────────────

def fetch_courses(user_id: str) -> List[Dict]:
    """
    Fetches courses for the authenticated user.
    Production: GET https://classroom.googleapis.com/v1/courses
    """
    token = get_token(user_id)
    if not token:
        raise PermissionError(f"User {user_id} is not authenticated.")

    logger.info(f"[Classroom] Fetching courses for {user_id} (stub)")
    # Simulated course list
    return [
        {"id": "course_001", "name": "Artificial Intelligence", "section": "A"},
        {"id": "course_002", "name": "Data Structures", "section": "B"},
        {"id": "course_003", "name": "Operating Systems", "section": "A"},
    ]


def fetch_assignments(user_id: str) -> List[Dict]:
    """
    Fetches all coursework (assignments) for the authenticated user.
    Production: GET https://classroom.googleapis.com/v1/courses/{courseId}/courseWork
    """
    token = get_token(user_id)
    if not token:
        raise PermissionError(f"User {user_id} is not authenticated.")

    logger.info(f"[Classroom] Fetching assignments for {user_id} (stub)")
    now = datetime.now(timezone.utc)
    # Simulated assignments
    assignments = [
        {
            "id": "assign_001",
            "course": "Artificial Intelligence",
            "title": "Lab Record – Neural Networks",
            "description": "Submit your NN lab record with backpropagation experiment.",
            "due_date": (now + timedelta(hours=36)).isoformat(),
        },
        {
            "id": "assign_002",
            "course": "Data Structures",
            "title": "Assignment 3 – AVL Trees",
            "description": "Implement insert/delete for AVL trees with rotation proofs.",
            "due_date": (now + timedelta(days=5)).isoformat(),
        },
        {
            "id": "assign_003",
            "course": "Operating Systems",
            "title": "Mini Project – Process Scheduler",
            "description": "Build a Round Robin + Priority scheduler simulation.",
            "due_date": (now + timedelta(days=10)).isoformat(),
        },
    ]
    _assignment_store[user_id] = assignments
    return assignments


# ──────────────────────────────────────────────────────────────────────────────
# 3. Smart Reminder Engine
# ──────────────────────────────────────────────────────────────────────────────

REMINDER_THRESHOLD_HOURS = 48  # fire reminder if due in ≤ 48 h


def check_deadlines(user_id: str) -> List[Dict]:
    """
    Scans stored assignments and returns those due within the threshold.
    Called by the background scheduler every 30 minutes.
    """
    assignments = _assignment_store.get(user_id, [])
    now = datetime.now(timezone.utc)
    upcoming = []

    for a in assignments:
        due = datetime.fromisoformat(a["due_date"])
        time_left = due - now
        hours_left = time_left.total_seconds() / 3600

        if 0 < hours_left <= REMINDER_THRESHOLD_HOURS and not a.get("reminded"):
            reminder = {
                "assignment_id": a["id"],
                "course": a["course"],
                "title": a["title"],
                "hours_left": round(hours_left, 1),
                "due_date": a["due_date"],
                "ai_offer": (
                    f"⚠️ [{a['course']}] '{a['title']}' is due in "
                    f"{round(hours_left, 1)} hours.\n"
                    f"💡 Want AI help? Send: "
                    f"\"Help me with '{a['title']}'\" in Study Mode."
                ),
            }
            upcoming.append(reminder)
            a["reminded"] = True  # prevent duplicate reminders
            _reminder_log.setdefault(user_id, []).append(reminder)
            logger.info(f"[Reminder] Fired for user={user_id} title='{a['title']}'")

    return upcoming


def get_reminder_log(user_id: str) -> List[Dict]:
    return _reminder_log.get(user_id, [])


# ──────────────────────────────────────────────────────────────────────────────
# 4. Scheduler Setup (APScheduler)
# ──────────────────────────────────────────────────────────────────────────────

try:
    from apscheduler.schedulers.asyncio import AsyncIOScheduler

    scheduler = AsyncIOScheduler()

    def _schedule_deadline_checks():
        """Add a periodic job for every registered user."""
        for user_id in list(_token_store.keys()):
            check_deadlines(user_id)

    scheduler.add_job(
        _schedule_deadline_checks,
        trigger="interval",
        minutes=30,
        id="deadline_checker",
        replace_existing=True,
    )
except ImportError:
    scheduler = None
    logger.warning("[Scheduler] apscheduler not installed — reminders will be on-demand only.")
