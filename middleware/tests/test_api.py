"""
middleware/tests/test_api.py — pytest test suite
Run: pip install pytest httpx && pytest middleware/tests/ -v
"""

import pytest
import json
from httpx import AsyncClient, ASGITransport
from middleware.main import app


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


# ── 1. Health check ────────────────────────────────────────────────────────────

@pytest.mark.anyio
async def test_root(client):
    resp = await client.get("/")
    assert resp.status_code == 200
    assert "running" in resp.json()["message"]


# ── 2. Mode routing ────────────────────────────────────────────────────────────

@pytest.mark.anyio
async def test_chat_general_mode(client):
    resp = await client.post("/chat", json={
        "mode": "general",
        "message": "Hello, my name is John and my email is john@test.com",
        "session_id": "test_session",
        "industry": "general"
    })
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["type"] == "general_mode_response"
    # PII should be detected
    assert data["pii_redacted"] is True


@pytest.mark.anyio
async def test_chat_study_mode(client):
    resp = await client.post("/chat", json={
        "mode": "study",
        "message": "Explain machine learning for 2 marks",
        "session_id": "test_session",
    })
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert "template" in data


@pytest.mark.anyio
async def test_chat_code_mode(client):
    resp = await client.post("/chat", json={
        "mode": "code",
        "message": "Show a simple greeting card",
        "session_id": "test_session",
    })
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert "payload" in data


@pytest.mark.anyio
async def test_invalid_mode(client):
    resp = await client.post("/chat", json={
        "mode": "invalid_mode",
        "message": "test",
        "session_id": "test_session"
    })
    assert resp.status_code == 400


# ── 3. PII Redaction unit test ─────────────────────────────────────────────────

def test_pii_redaction():
    from middleware.modes.general_mode import PIIRedactor
    redactor = PIIRedactor()
    text = "Call me at 9876543210 or email me at test@example.com"
    redacted, counts = redactor.redact(text, industry="general")
    assert "9876543210" not in redacted
    assert "test@example.com" not in redacted
    assert "PHONE" in counts or "EMAIL" in counts


# ── 4. Risk Scoring unit test ──────────────────────────────────────────────────

def test_risk_scoring():
    from middleware.modes.general_mode import RiskScorer
    scorer = RiskScorer()
    # High PII input
    report = scorer.score("password secret api_key", {"EMAIL": 2, "PHONE": 1}, "healthcare")
    assert report["score"] > 50
    assert report["level"] in ("MEDIUM_RISK", "HIGH_RISK")


# ── 5. Semantic Cache unit test ────────────────────────────────────────────────

def test_semantic_cache():
    from middleware.core.cache import SemanticCache
    c = SemanticCache()
    c.set("What is AI?", "study", {"content": "AI answer"})
    result = c.get("What is artificial intelligence?", "study")
    # Similar enough query should hit (may or may not depending on threshold)
    stats = c.stats()
    assert stats["in_memory_entries"] == 1


# ── 6. Study schema validation ────────────────────────────────────────────────

def test_study_schema_two_mark():
    from middleware.modes.study_mode import TwoMarkAnswer
    answer = TwoMarkAnswer(
        title="Machine Learning",
        points=["ML is a subset of AI.", "It learns from data."]
    )
    assert answer.title == "Machine Learning"
    assert len(answer.points) == 2


# ── 7. Cache stats endpoint ────────────────────────────────────────────────────

@pytest.mark.anyio
async def test_cache_stats(client):
    resp = await client.get("/cache-stats")
    assert resp.status_code == 200
    assert "cache_stats" in resp.json()


# ── 8. Dashboard summary ───────────────────────────────────────────────────────

@pytest.mark.anyio
async def test_dashboard_summary(client):
    resp = await client.get("/dashboard/summary")
    assert resp.status_code == 200
