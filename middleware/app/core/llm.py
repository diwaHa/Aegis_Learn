"""
app/core/llm.py — Gemini LLM client shared by all mode handlers.
Falls back to stubs if GEMINI_API_KEY is not set.
"""

import json
import logging
from typing import Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

try:
    import google.generativeai as genai
    _GEMINI_AVAILABLE = True
except ImportError:
    _GEMINI_AVAILABLE = False
    logger.warning("[LLM] google-generativeai not installed. Run: pip install google-generativeai")

if _GEMINI_AVAILABLE and settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    _model = genai.GenerativeModel(settings.LITELLM_MODEL)
    logger.info(f"[LLM] Gemini configured — model={settings.LITELLM_MODEL}")
else:
    _model = None
    logger.warning("[LLM] Set GEMINI_API_KEY in middleware/.env to enable real LLM calls.")


async def call_llm(prompt: str, system_instruction: str = "") -> str:
    """Plain-text Gemini response. Returns stub if not configured."""
    if _model is None:
        return f"[STUB — set GEMINI_API_KEY] Prompt: {prompt[:80]}"
    full = f"{system_instruction}\n\n{prompt}" if system_instruction else prompt
    try:
        return _model.generate_content(full).text
    except Exception as e:
        logger.error(f"[LLM] call failed: {e}")
        return f"[LLM ERROR] {e}"


async def call_llm_json(prompt: str, system_instruction: str = "", schema: Optional[Any] = None) -> dict:
    """JSON-forcing Gemini call validated by caller's Pydantic schema."""
    if _model is None:
        return {"error": "LLM not configured", "stub": True}

    schema_hint = (
        f"Schema:\n{json.dumps(schema.model_json_schema() if hasattr(schema, 'model_json_schema') else schema, indent=2)}\n\n"
        if schema else ""
    )
    full = (
        f"{system_instruction}\n\n"
        "IMPORTANT: Respond ONLY with valid JSON matching the schema below. "
        "No markdown fences, no explanation.\n"
        f"{schema_hint}{prompt}"
    )
    try:
        raw = _model.generate_content(full).text.strip()
        raw = raw.lstrip("```json").lstrip("```").rstrip("```").strip()
        return json.loads(raw)
    except json.JSONDecodeError as e:
        logger.error(f"[LLM] JSON parse error: {e}")
        return {"error": "JSON parse failed"}
    except Exception as e:
        logger.error(f"[LLM] call failed: {e}")
        return {"error": str(e)}
