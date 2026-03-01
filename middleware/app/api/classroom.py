"""
app/api/classroom.py — Google Classroom integration and reminder endpoints.
All routes require JWT authentication.
"""

from fastapi import APIRouter, Depends, HTTPException
from app.core.security import verify_token

router = APIRouter(prefix="/classroom", tags=["Classroom & Reminders"])
_dep = [Depends(verify_token)]


@router.get("/courses/{user_id}", dependencies=_dep, summary="Fetch enrolled courses")
async def get_courses(user_id: str):
    from app.core.classroom import fetch_courses
    try:
        return {"courses": fetch_courses(user_id)}
    except PermissionError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/assignments/{user_id}", dependencies=_dep, summary="Fetch all assignments with due dates")
async def get_assignments(user_id: str):
    from app.core.classroom import fetch_assignments
    try:
        return {"assignments": fetch_assignments(user_id)}
    except PermissionError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/reminders/{user_id}", dependencies=_dep, summary="Get active deadline reminders")
async def get_reminders(user_id: str):
    from app.core.classroom import check_deadlines, get_reminder_log
    upcoming = check_deadlines(user_id)
    return {
        "upcoming_reminders": upcoming,
        "all_reminders_sent": get_reminder_log(user_id),
    }
