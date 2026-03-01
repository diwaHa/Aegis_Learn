"""
middleware/core/cache.py — PRODUCTION VERSION
SemanticCache with Redis backend (+ fast in-memory TF-cosine fallback)
ContextWindowManager for conversation history pruning.
"""

import hashlib
import math
import re
import os
import json
import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

# ── Redis (with in-memory fallback) ──────────────────────────────────────────
try:
    import redis
    _REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    _redis_client = redis.from_url(_REDIS_URL, decode_responses=True, socket_connect_timeout=2)
    _redis_client.ping()
    _REDIS_AVAILABLE = True
    logger.info(f"[Cache] Redis connected: {_REDIS_URL}")
except Exception as e:
    _redis_client = None
    _REDIS_AVAILABLE = False
    logger.warning(f"[Cache] Redis not available ({e}) — using in-memory fallback.")

CACHE_TTL_SECONDS = 3600  # 1 hour TTL for Redis entries
SIMILARITY_THRESHOLD = 0.82
MAX_IN_MEMORY_ENTRIES = 500


# ── TF-Cosine helpers ─────────────────────────────────────────────────────────

def _tokenize(text: str) -> List[str]:
    return re.findall(r"\w+", text.lower())

def _to_tf(tokens: List[str]) -> Dict[str, float]:
    tf: Dict[str, float] = {}
    for t in tokens:
        tf[t] = tf.get(t, 0) + 1
    n = len(tokens) or 1
    return {k: v / n for k, v in tf.items()}

def _cosine(a: Dict[str, float], b: Dict[str, float]) -> float:
    keys = set(a) | set(b)
    dot = sum(a.get(k, 0) * b.get(k, 0) for k in keys)
    mag_a = math.sqrt(sum(v ** 2 for v in a.values())) or 1
    mag_b = math.sqrt(sum(v ** 2 for v in b.values())) or 1
    return dot / (mag_a * mag_b)


# ── Semantic Cache ────────────────────────────────────────────────────────────

class SemanticCache:
    def __init__(self):
        self._store: Dict[str, Dict] = {}
        self._hits = 0
        self._misses = 0

    def _cache_key(self, query: str, mode: str) -> str:
        return f"cache:{mode}:{hashlib.md5(query.encode()).hexdigest()}"

    def get(self, query: str, mode: str) -> Optional[Any]:
        """Check Redis first, then in-memory similarity search."""
        # ── Redis exact-key lookup ────────────────────────────────────────────
        if _REDIS_AVAILABLE and _redis_client:
            key = self._cache_key(query, mode)
            val = _redis_client.get(key)
            if val:
                self._hits += 1
                logger.info(f"[Cache] Redis HIT mode={mode}")
                return json.loads(val)

        # ── In-memory cosine similarity search ───────────────────────────────
        query_vec = _to_tf(_tokenize(query))
        for entry in self._store.values():
            if entry["mode"] != mode:
                continue
            sim = _cosine(query_vec, entry["vec"])
            if sim >= SIMILARITY_THRESHOLD:
                self._hits += 1
                logger.info(f"[Cache] Memory HIT similarity={sim:.2f} mode={mode}")
                return entry["response"]

        self._misses += 1
        return None

    def set(self, query: str, mode: str, response: Any) -> None:
        # ── Store in Redis ────────────────────────────────────────────────────
        if _REDIS_AVAILABLE and _redis_client:
            key = self._cache_key(query, mode)
            try:
                _redis_client.setex(key, CACHE_TTL_SECONDS, json.dumps(response, default=str))
            except Exception as e:
                logger.warning(f"[Cache] Redis SET failed: {e}")

        # ── Store in memory (for cosine search) ───────────────────────────────
        if len(self._store) >= MAX_IN_MEMORY_ENTRIES:
            oldest = next(iter(self._store))
            del self._store[oldest]
        key = hashlib.md5(f"{mode}:{query}".encode()).hexdigest()
        self._store[key] = {
            "mode": mode,
            "query": query,
            "response": response,
            "vec": _to_tf(_tokenize(query)),
        }

    def stats(self) -> Dict[str, Any]:
        total = self._hits + self._misses
        return {
            "backend": "redis" if _REDIS_AVAILABLE else "in_memory",
            "in_memory_entries": len(self._store),
            "hits": self._hits,
            "misses": self._misses,
            "hit_rate": round(self._hits / max(1, total), 3),
        }


# ── Context Window Manager ────────────────────────────────────────────────────

class ContextWindowManager:
    def __init__(self, max_turns: int = 3):
        self._sessions: Dict[str, List[Dict]] = {}
        self._max_turns = max_turns

    def add(self, session_id: str, role: str, content: str) -> None:
        history = self._sessions.setdefault(session_id, [])
        history.append({"role": role, "content": content})
        if len(history) > self._max_turns * 2:
            self._sessions[session_id] = history[-(self._max_turns * 2):]

    def get_history(self, session_id: str) -> List[Dict]:
        return self._sessions.get(session_id, [])

    def clear(self, session_id: str) -> None:
        self._sessions.pop(session_id, None)

    def token_estimate(self, session_id: str, chars_per_token: int = 4) -> int:
        total = sum(len(m["content"]) for m in self.get_history(session_id))
        return total // chars_per_token


# ── Compressed system prompts ─────────────────────────────────────────────────

SYSTEM_PROMPTS = {
    "general": "You are a helpful assistant. Answer concisely.",
    "code":    "You generate A2UI JSON responses. Be precise.",
    "study":   "Answer in the given academic format. Be accurate.",
}

def get_compressed_system_prompt(mode: str) -> str:
    return SYSTEM_PROMPTS.get(mode, SYSTEM_PROMPTS["general"])


# ── Singletons ────────────────────────────────────────────────────────────────
cache = SemanticCache()
context_manager = ContextWindowManager(max_turns=3)
