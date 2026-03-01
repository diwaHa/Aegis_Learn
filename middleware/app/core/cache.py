"""
app/core/cache.py — Semantic cache (Redis + in-memory fallback) and
context window manager.
"""

import hashlib, math, re, json, logging
from typing import Any, Dict, List, Optional
from app.config import settings

logger = logging.getLogger(__name__)

try:
    import redis as _redis_lib
    _client = _redis_lib.from_url(settings.REDIS_URL, decode_responses=True, socket_connect_timeout=2)
    _client.ping()
    _REDIS = True
    logger.info(f"[Cache] Redis connected: {settings.REDIS_URL}")
except Exception as e:
    _client = None
    _REDIS = False
    logger.warning(f"[Cache] Redis unavailable ({e}) — using in-memory fallback.")


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
    ma = math.sqrt(sum(v**2 for v in a.values())) or 1
    mb = math.sqrt(sum(v**2 for v in b.values())) or 1
    return dot / (ma * mb)


class SemanticCache:
    def __init__(self):
        self._store: Dict[str, Dict] = {}
        self._hits = self._misses = 0

    def _key(self, q: str, mode: str) -> str:
        return f"cache:{mode}:{hashlib.md5(q.encode()).hexdigest()}"

    def get(self, query: str, mode: str) -> Optional[Any]:
        if _REDIS and _client:
            v = _client.get(self._key(query, mode))
            if v:
                self._hits += 1
                return json.loads(v)
        qv = _to_tf(_tokenize(query))
        for e in self._store.values():
            if e["mode"] == mode and _cosine(qv, e["vec"]) >= settings.SIMILARITY_THRESHOLD:
                self._hits += 1
                return e["response"]
        self._misses += 1
        return None

    def set(self, query: str, mode: str, response: Any) -> None:
        if _REDIS and _client:
            try:
                _client.setex(self._key(query, mode), settings.CACHE_TTL, json.dumps(response, default=str))
            except Exception as e:
                logger.warning(f"[Cache] Redis SET failed: {e}")
        if len(self._store) >= 500:
            del self._store[next(iter(self._store))]
        key = hashlib.md5(f"{mode}:{query}".encode()).hexdigest()
        self._store[key] = {"mode": mode, "response": response, "vec": _to_tf(_tokenize(query))}

    def stats(self) -> Dict[str, Any]:
        total = self._hits + self._misses
        return {
            "backend": "redis" if _REDIS else "in_memory",
            "entries": len(self._store),
            "hits": self._hits,
            "misses": self._misses,
            "hit_rate": round(self._hits / max(1, total), 3),
        }


class ContextWindowManager:
    def __init__(self):
        self._sessions: Dict[str, List[Dict]] = {}

    def add(self, session_id: str, role: str, content: str) -> None:
        h = self._sessions.setdefault(session_id, [])
        h.append({"role": role, "content": content})
        limit = settings.MAX_CONTEXT_TURNS * 2
        if len(h) > limit:
            self._sessions[session_id] = h[-limit:]

    def get_history(self, session_id: str) -> List[Dict]:
        return self._sessions.get(session_id, [])

    def clear(self, session_id: str) -> None:
        self._sessions.pop(session_id, None)

    def token_estimate(self, session_id: str) -> int:
        return sum(len(m["content"]) for m in self.get_history(session_id)) // 4


cache = SemanticCache()
context_manager = ContextWindowManager()
