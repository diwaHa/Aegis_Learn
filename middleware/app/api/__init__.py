"""app/api package — re-exports all routers for easy import in main.py"""
from app.api import health, chat, auth, classroom, dashboard

__all__ = ["health", "chat", "auth", "classroom", "dashboard"]
