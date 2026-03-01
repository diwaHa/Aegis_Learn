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

from core.llm import call_llm

logger = logging.getLogger(__name__)

_CODE_SYSTEM_PROMPT = (
    "You are an A2UI agent. Generate valid A2UI v0.9 JSONL messages. "
    "Keep output concise and focused. Use this format:\n"
    '{"version": "v0.9", "createSurface": {"surfaceId": "main", "catalogId": "basic"}}\n'
    '{"version": "v0.9", "updateComponents": {"surfaceId": "main", "components": [{"id": "root", "component": {"Column": {"children": {"explicitList": ["component1"]}}}}, {"id": "component1", "component": {"Text": {"text": {"literalString": "Hello"}}}}]}}\n'
    '{"beginRendering": {"surfaceId": "main", "root": "root"}}\n'
    "CRITICAL: Output ONLY raw JSONL - no markdown, no code blocks, no explanations. "
    "Each line must be complete JSON. Keep components simple and focused."
)


class CodeModeHandler:
    async def handle(self, message: str, session_id: str) -> Dict[str, Any]:
        logger.info(f"[CodeMode] Processing: {message}")

        # Try to generate real A2UI from LLM
        raw = await call_llm(message, system_instruction=_CODE_SYSTEM_PROMPT)
        logger.info(f"[CodeMode] LLM raw output length: {len(raw)}")
        logger.info(f"[CodeMode] LLM raw output preview: {raw[:200]}...")

        # Parse JSONL lines
        lines = [l.strip() for l in raw.strip().splitlines() if l.strip()]
        logger.info(f"[CodeMode] Found {len(lines)} lines to parse")
        logger.info(f"[CodeMode] Full raw output length: {len(raw)}")
        
        # Remove markdown wrapper if present
        if lines and lines[0].startswith('```'):
            lines = lines[1:]  # Remove opening ```
        if lines and lines[-1].startswith('```'):
            lines = lines[:-1]  # Remove closing ```
        
        parsed = []
        for i, line in enumerate(lines):
            try:
                parsed_line = json.loads(line)
                logger.info(f"[CodeMode] Successfully parsed line {i}: {str(parsed_line)[:100]}...")
                parsed.append(parsed_line)
            except json.JSONDecodeError as e:
                logger.warning(f"[CodeMode] Failed to parse line {i}: {e}")
                logger.warning(f"[CodeMode] Line content: {line[:200]}...")
                # Try to fix truncated JSON by adding missing closing braces
                if 'updateComponents' in line and line.count('{') > line.count('}'):
                    logger.info(f"[CodeMode] Attempting to fix truncated JSON...")
                    fixed_line = line + '}' * (line.count('{') - line.count('}'))
                    try:
                        parsed_line = json.loads(fixed_line)
                        logger.info(f"[CodeMode] Successfully fixed and parsed line {i}")
                        parsed.append(parsed_line)
                    except json.JSONDecodeError:
                        logger.warning(f"[CodeMode] Could not fix truncated JSON")
                continue  # skip non-JSON lines in LLM output

        if not parsed:
            logger.warning("[CodeMode] No valid JSONL parsed, using fallback")
            # Fallback: return a minimal valid A2UI response
            parsed = [
                {"version": "v0.9", "createSurface": {"surfaceId": "main", "catalogId": "basic"}},
                {"version": "v0.9", "updateComponents": {"surfaceId": "main", "components": [
                    {"id": "root", "component": {"Column": {"children": {"explicitList": ["msg"]}}}},
                    {"id": "msg", "component": {"Text": {"text": {"literalString": f"Generated for: {message[:50]}..."}}}}
                ]}},
                {"beginRendering": {"surfaceId": "main", "root": "root"}}
            ]

        logger.info(f"[CodeMode] Final parsed result has {len(parsed)} items")
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
