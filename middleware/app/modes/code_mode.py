"""
app/modes/code_mode.py — A2UI JSONL response generator.
Sends a structured A2UI system prompt to Gemini and parses the JSONL output.
"""

import json, logging, sys, os
from typing import Any, Dict
from app.core.llm import call_llm

logger = logging.getLogger(__name__)

# Make the a2ui_agent library available (lives in the monorepo)
_repo = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
for _p in [_repo, os.path.join(_repo, "a2a_agents", "python", "a2ui_agent", "src")]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

_SYSTEM = (
    "You are an A2UI agent. Respond ONLY with valid A2UI JSONL messages "
    "(surfaceUpdate, dataModelUpdate, beginRendering). "
    "One JSON object per line. No markdown. No explanation."
)


async def handle_code_mode(message: str, session_id: str) -> Dict[str, Any]:
    logger.info(f"[CodeMode] session={session_id}")
    raw = await call_llm(message, system_instruction=_SYSTEM)

    parsed = []
    for line in raw.strip().splitlines():
        line = line.strip()
        if line:
            try:
                parsed.append(json.loads(line))
            except json.JSONDecodeError:
                continue

    if not parsed:
        parsed = [
            {"surfaceUpdate": {"components": [
                {"id": "root", "component": {"Column": {"children": {"explicitList": ["msg"]}}}},
                {"id": "msg",  "component": {"Text":   {"text": {"literalString": raw[:500]}}}}
            ]}},
            {"beginRendering": {"root": "root"}},
        ]

    return {"type": "a2ui_response", "payload": parsed}
