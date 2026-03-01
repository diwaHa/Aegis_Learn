"""
middleware/core/llm.py
──────────────────────
Central Gemini LLM client used by all 3 mode handlers.
Falls back gracefully if the API key is not set.
"""

import os
import json
import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)

# ── Gemini SDK ────────────────────────────────────────────────────────────────
try:
    import google.generativeai as genai
    _GEMINI_AVAILABLE = True
except ImportError:
    _GEMINI_AVAILABLE = False
    logger.warning("[LLM] google-generativeai not installed. Run: pip install google-generativeai")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
LITELLM_MODEL  = os.getenv("LITELLM_MODEL", "gemini-2.0-flash")

if _GEMINI_AVAILABLE and GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    _model = genai.GenerativeModel(LITELLM_MODEL)
    logger.info(f"[LLM] Gemini configured — model={LITELLM_MODEL}")
else:
    _model = None
    logger.warning("[LLM] Gemini not configured. Set GEMINI_API_KEY in middleware/.env")


# ── Public helpers ────────────────────────────────────────────────────────────

async def call_llm(prompt: str, system_instruction: str = "") -> str:
    """
    Makes a real Gemini API call.
    Returns a plain-text string response.
    Falls back to a stub message if the SDK / key is unavailable.
    """
    if _model is None:
        return f"[STUB] LLM not configured. Prompt received: {prompt[:80]}"

    full_prompt = f"{system_instruction}\n\n{prompt}" if system_instruction else prompt
    try:
        response = _model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        logger.error(f"[LLM] Gemini call failed: {e}")
        return f"[LLM ERROR] {str(e)}"


async def call_llm_json(prompt: str, system_instruction: str = "", schema: Optional[Any] = None) -> dict:
    """
    Makes a Gemini API call that forces JSON output.
    Parses and returns the result as a dict.
    Falls back to a stub dict if the SDK / key is unavailable.
    """
    if _model is None:
        return {"error": "LLM not configured", "stub": True}

    json_instruction = (
        "You MUST respond ONLY with valid JSON matching this schema. "
        "No markdown, no explanation, no code fences.\n"
        f"Schema: {json.dumps(schema.schema() if hasattr(schema, 'schema') else schema, indent=2)}\n\n"
        if schema else
        "You MUST respond ONLY with valid JSON. No markdown, no explanation.\n\n"
    )
    full_prompt = f"{system_instruction}\n\n{json_instruction}{prompt}"

    try:
        response = _model.generate_content(full_prompt)
        raw = response.text.strip().lstrip("```json").rstrip("```").strip()
        return json.loads(raw)
    except json.JSONDecodeError as e:
        logger.error(f"[LLM] JSON parse failed: {e}\nRaw: {response.text[:200]}")
        return {"error": "JSON parse failed", "raw": response.text[:200]}
    except Exception as e:
        logger.error(f"[LLM] Gemini JSON call failed: {e}")
        return {"error": str(e)}
