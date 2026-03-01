"""
app/router.py — Central mode dispatcher.
Wraps every request in the semantic cache + context window layer.
"""

import logging
from typing import Any, Optional
from app.modes.general_mode import handle_general_mode
from app.modes.study_mode   import handle_study_mode
from app.modes.code_mode    import handle_code_mode
from app.core.cache         import cache, context_manager

logger = logging.getLogger(__name__)

_HANDLERS = {
    "general": handle_general_mode,
    "study":   handle_study_mode,
    "code":    handle_code_mode,
}


async def route_request(
    mode: str,
    message: str,
    session_id: str,
    industry: Optional[str] = "general",
) -> Any:
    """
    Pipeline:
    1. Semantic cache lookup   — return immediately if similar query is cached
    2. Log context window info
    3. Dispatch to mode handler
    4. Cache the result
    5. Update conversation history
    """
    logger.info(f"[Router] mode={mode} industry={industry} session={session_id}")

    # 1 — Cache hit?
    cached = cache.get(message, mode)
    if cached is not None:
        cached["from_cache"] = True
        return cached

    # 2 — Context info
    history = context_manager.get_history(session_id)
    logger.info(f"[Router] Context: {len(history)//2} turns | ~{context_manager.token_estimate(session_id)} tokens")

    # 3 — Dispatch
    handler = _HANDLERS.get(mode)
    if handler is None:
        raise ValueError(f"Unknown mode '{mode}'. Valid options: {list(_HANDLERS)}")

    if mode == "general":
        response = await handler(message, session_id, industry=industry)
    else:
        response = await handler(message, session_id)

    # 4 — Store result
    response["from_cache"] = False
    cache.set(message, mode, response)

    # 5 — Update history
    context_manager.add(session_id, "user", message)
    context_manager.add(session_id, "assistant",
                        str(response.get("llm_response") or response.get("content") or ""))

    return response
