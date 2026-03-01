from typing import Any, Optional
from modes import handle_general_mode, handle_code_mode, handle_study_mode
from core.cache import cache, context_manager
import logging

logger = logging.getLogger(__name__)


async def route_request(
    mode: str,
    message: str,
    session_id: str,
    industry: Optional[str] = "general",
) -> Any:
    """
    Routes a request through the optimization layer and to the correct handler.

    Optimization steps:
    1. Semantic cache lookup  — skip LLM if a similar query result is cached.
    2. Context pruning        — attach recent history to keep token usage bounded.
    3. Dispatch to handler.
    4. Cache the new result.
    5. Update context history.
    """
    logger.info(f"[Router] mode={mode} industry={industry} session={session_id}")

    # ── 1. Semantic Cache Check ───────────────────────────────────────────────
    cached = cache.get(message, mode)
    if cached is not None:
        cached["from_cache"] = True
        return cached

    # ── 2. Build context for LLM (used by handlers in future live integration) ─
    history = context_manager.get_history(session_id)
    token_est = context_manager.token_estimate(session_id)
    logger.info(f"[Context] session={session_id} turns={len(history)//2} ~tokens={token_est}")

    # ── 3. Dispatch ───────────────────────────────────────────────────────────
    if mode == "general":
        response = await handle_general_mode(message, session_id, industry=industry)
    elif mode == "code":
        response = await handle_code_mode(message, session_id)
    elif mode == "study":
        response = await handle_study_mode(message, session_id)
    else:
        raise ValueError(f"Unknown mode: {mode}")

    # ── 4. Store in cache ─────────────────────────────────────────────────────
    response["from_cache"] = False
    cache.set(message, mode, response)

    # ── 5. Update context window ──────────────────────────────────────────────
    context_manager.add(session_id, "user", message)
    llm_text = str(response.get("llm_response") or response.get("output") or "")
    context_manager.add(session_id, "assistant", llm_text)

    return response
