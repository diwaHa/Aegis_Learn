"""
app/api/health.py — System health and observability endpoints.
No authentication required so monitoring tools can poll freely.
"""

from fastapi import APIRouter

router = APIRouter(tags=["Health & Observability"])


@router.get("/", summary="Health check")
async def root():
    return {"message": "Multi-Mode AI Middleware is running", "version": "1.0.0"}


@router.get("/health", summary="Liveness probe")
async def health():
    return {"status": "ok"}


@router.get("/cache-stats", summary="Semantic cache hit rate and entry count")
async def cache_stats():
    from app.core.cache import cache
    return {"cache_stats": cache.stats()}
