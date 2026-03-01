"""
middleware/modes/code_mode.py — PRODUCTION VERSION
Generates real A2UI JSONL responses from Gemini.
"""

import logging
import json
import sys
import os
from typing import Any, Dict

# Add repo root to path so the a2ui_agent library can be imported
_repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if _repo_root not in sys.path:
    sys.path.insert(0, _repo_root)
_lib_root = os.path.join(_repo_root, "a2a_agents", "python", "a2ui_agent", "src")
if _lib_root not in sys.path:
    sys.path.insert(0, _lib_root)

from middleware.core.llm import call_llm

logger = logging.getLogger(__name__)

_CODE_SYSTEM_PROMPT = (
    "You are an A2UI agent. When given a user request, respond with valid A2UI JSONL "
    "messages (surfaceUpdate, dataModelUpdate, beginRendering) in a flat adjacency-list "
    "format. Output raw JSONL only — one JSON object per line, no extra text."
)


class CodeModeHandler:
    async def handle(self, message: str, session_id: str) -> Dict[str, Any]:
        logger.info(f"[CodeMode] Processing: {message}")

        # Try to generate real A2UI from LLM
        raw = await call_llm(message, system_instruction=_CODE_SYSTEM_PROMPT)

        # Parse JSONL lines
        lines = [l.strip() for l in raw.strip().splitlines() if l.strip()]
        parsed = []
        for line in lines:
            try:
                parsed.append(json.loads(line))
            except json.JSONDecodeError:
                continue  # skip non-JSON lines in LLM output

        if not parsed:
            # Fallback: return a minimal valid A2UI response
            parsed = [
                {"surfaceUpdate": {"components": [
                    {"id": "root", "component": {"Column": {"children": {"explicitList": ["msg"]}}}},
                    {"id": "msg", "component": {"Text": {"text": {"literalString": raw[:500]}}}}
                ]}},
                {"beginRendering": {"root": "root"}}
            ]

        return {
            "type": "a2ui_response",
            "payload": parsed,
            "raw_llm": raw[:300] if len(raw) > 300 else raw,
        }


_handler = None

async def handle_code_mode(message: str, session_id: str):
    global _handler
    if _handler is None:
        _handler = CodeModeHandler()
    return await _handler.handle(message, session_id)
