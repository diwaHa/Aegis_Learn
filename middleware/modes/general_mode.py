"""
middleware/modes/general_mode.py — PRODUCTION VERSION
Full privacy pipeline:
  spaCy NER (+ regex fallback) → Redaction → Risk Scoring
  → Real LLM Call → MongoDB Audit Log (with Fernet AES encryption)
"""

import re
import logging
import hashlib
import json
import os
from datetime import datetime, timezone
from typing import Dict, Tuple, Any, List

logger = logging.getLogger(__name__)

# ── spaCy NER (with regex fallback) ──────────────────────────────────────────
try:
    import spacy
    _nlp = spacy.load("en_core_web_sm")
    _SPACY_AVAILABLE = True
    logger.info("[Privacy] spaCy NER loaded (en_core_web_sm)")
except (ImportError, OSError):
    _nlp = None
    _SPACY_AVAILABLE = False
    logger.warning("[Privacy] spaCy not available — using regex only. "
                   "Run: pip install spacy && python -m spacy download en_core_web_sm")

# ── MongoDB (with in-memory fallback) ─────────────────────────────────────────
try:
    from pymongo import MongoClient
    _mongo_uri = os.getenv("MONGODB_URI", "")
    _mongo_db_name = os.getenv("MONGODB_DB_NAME", "ai_middleware_db")
    if _mongo_uri:
        _mongo_client = MongoClient(_mongo_uri, serverSelectionTimeoutMS=3000)
        _mongo_db = _mongo_client[_mongo_db_name]
        _audit_collection = _mongo_db["audit_logs"]
        _MONGO_AVAILABLE = True
        logger.info(f"[Audit] MongoDB connected: {_mongo_db_name}")
    else:
        raise ValueError("MONGODB_URI not set")
except Exception as e:
    _MONGO_AVAILABLE = False
    _audit_collection = None
    logger.warning(f"[Audit] MongoDB not available ({e}) — using in-memory fallback.")

# ── Fernet AES Encryption ─────────────────────────────────────────────────────
try:
    from cryptography.fernet import Fernet
    _FERNET_KEY = os.getenv("FERNET_KEY", "")
    if not _FERNET_KEY:
        _FERNET_KEY = Fernet.generate_key().decode()
        logger.warning(f"[Audit] No FERNET_KEY in .env — generated ephemeral key. "
                       f"Set FERNET_KEY={_FERNET_KEY} in your .env to persist.")
    _fernet = Fernet(_FERNET_KEY.encode() if isinstance(_FERNET_KEY, str) else _FERNET_KEY)
    _FERNET_AVAILABLE = True
except ImportError:
    _fernet = None
    _FERNET_AVAILABLE = False
    logger.warning("[Audit] cryptography not installed. Run: pip install cryptography")

# ── PII Regex Patterns ────────────────────────────────────────────────────────
PII_PATTERNS = {
    "EMAIL":   r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b",
    "PHONE":   r"\b(?:\+91|0)?[6-9]\d{9}\b",
    "AADHAAR": r"\b\d{4}\s?\d{4}\s?\d{4}\b",
    "PAN":     r"\b[A-Z]{5}[0-9]{4}[A-Z]\b",
    "IP":      r"\b(?:\d{1,3}\.){3}\d{1,3}\b",
    "URL":     r"https?://[^\s]+",
}

SENSITIVE_KEYWORDS = {
    "password": 5, "token": 4, "secret": 4, "api_key": 5,
    "credit card": 5, "cvv": 5, "otp": 4, "pin": 3,
    "diagnosis": 3, "patient": 2, "prescription": 3,
    "account number": 4, "ifsc": 3,
}

INDUSTRY_POLICIES = {
    "healthcare": {
        "extra_patterns": [r"\b(?:blood pressure|diabetes|cancer|HIV|diagnosis|prescription)\b"],
        "risk_multiplier": 2.0,
    },
    "finance": {
        "extra_patterns": [r"\b(?:account|balance|transaction|IFSC|SWIFT|loan)\b"],
        "risk_multiplier": 1.7,
    },
    "legal": {
        "extra_patterns": [r"\b(?:case number|FIR|judgment|defendant|plaintiff)\b"],
        "risk_multiplier": 1.5,
    },
    "general": {"extra_patterns": [], "risk_multiplier": 1.0},
}


# ── PII Redactor ──────────────────────────────────────────────────────────────

class PIIRedactor:
    def redact(self, text: str, industry: str = "general") -> Tuple[str, Dict[str, int]]:
        redacted = text
        pii_counts: Dict[str, int] = {}

        # 1. Regex-based redaction
        for label, pattern in PII_PATTERNS.items():
            matches = re.findall(pattern, redacted, re.IGNORECASE)
            if matches:
                pii_counts[label] = len(matches)
                for i, match in enumerate(matches, 1):
                    redacted = redacted.replace(match, f"[{label}_{i}]", 1)

        # 2. spaCy NER for PERSON, ORG, GPE entities
        if _SPACY_AVAILABLE and _nlp:
            doc = _nlp(redacted)
            for ent in doc.ents:
                if ent.label_ in ("PERSON", "ORG", "GPE"):
                    label = ent.label_
                    pii_counts[label] = pii_counts.get(label, 0) + 1
                    redacted = redacted.replace(ent.text, f"[{label}]", 1)

        # 3. Industry-specific patterns
        policy = INDUSTRY_POLICIES.get(industry, INDUSTRY_POLICIES["general"])
        for pattern in policy.get("extra_patterns", []):
            matches = re.findall(pattern, redacted, re.IGNORECASE)
            if matches:
                label = "INDUSTRY_SENSITIVE"
                pii_counts[label] = pii_counts.get(label, 0) + len(matches)
                for match in matches:
                    redacted = re.sub(re.escape(match), f"[{label}]", redacted, flags=re.IGNORECASE)

        return redacted, pii_counts


# ── Risk Scorer ───────────────────────────────────────────────────────────────

class RiskScorer:
    def score(self, text: str, pii_counts: Dict[str, int], industry: str = "general") -> Dict[str, Any]:
        policy = INDUSTRY_POLICIES.get(industry, INDUSTRY_POLICIES["general"])
        multiplier = policy["risk_multiplier"]
        pii_score = sum(count * 10 for count in pii_counts.values())
        keyword_score = sum(
            weight for kw, weight in SENSITIVE_KEYWORDS.items() if kw in text.lower()
        )
        final_score = min(100, int((pii_score + keyword_score) * multiplier))
        level = "SAFE" if final_score <= 20 else "MEDIUM_RISK" if final_score <= 60 else "HIGH_RISK"
        return {
            "score": final_score,
            "level": level,
            "display": {"SAFE": "🟢", "MEDIUM_RISK": "🟡", "HIGH_RISK": "🔴"}[level],
            "pii_types_found": list(pii_counts.keys()),
        }


# ── Audit Logger (MongoDB + Fernet) ──────────────────────────────────────────

class AuditLogger:
    def __init__(self):
        self._logs: List[Dict] = []   # fallback in-memory store

    def _encrypt(self, text: str) -> str:
        if _fernet:
            return _fernet.encrypt(text.encode()).decode()
        import base64
        return base64.b64encode(text.encode()).decode()  # base64 stub

    def log(self, session_id: str, redacted_prompt: str, risk_report: Dict, industry: str):
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "session_hash": hashlib.sha256(session_id.encode()).hexdigest()[:12],
            "industry": industry,
            "redacted_prompt_encrypted": self._encrypt(redacted_prompt[:1000]),
            "risk_score": risk_report["score"],
            "risk_level": risk_report["level"],
            "pii_detected": risk_report["pii_types_found"],
        }
        if _MONGO_AVAILABLE and _audit_collection is not None:
            try:
                _audit_collection.insert_one(entry)
                return
            except Exception as e:
                logger.error(f"[Audit] MongoDB insert failed: {e}")
        self._logs.append(entry)

    def get_logs(self) -> List[Dict]:
        if _MONGO_AVAILABLE and _audit_collection is not None:
            try:
                return list(_audit_collection.find({}, {"_id": 0}).sort("timestamp", -1).limit(100))
            except Exception:
                pass
        return self._logs


# ── Singletons ────────────────────────────────────────────────────────────────

_redactor = PIIRedactor()
_scorer = RiskScorer()
_audit_logger = AuditLogger()


# ── Handler ───────────────────────────────────────────────────────────────────

async def handle_general_mode(
    message: str, session_id: str, industry: str = "general"
) -> Dict[str, Any]:
    from core.llm import call_llm

    # 1. Redact
    redacted_prompt, pii_counts = _redactor.redact(message, industry)

    # 2. Risk Score
    risk_report = _scorer.score(message, pii_counts, industry)

    # 3. Audit Log
    _audit_logger.log(session_id, redacted_prompt, risk_report, industry)

    # 4. Real LLM call with sanitized prompt
    system_instruction = (
        "You are a helpful, concise assistant. The user's message has been "
        "privacy-sanitized before reaching you. Answer helpfully."
    )
    llm_response = await call_llm(redacted_prompt, system_instruction=system_instruction)

    return {
        "type": "general_mode_response",
        "risk_report": risk_report,
        "pii_redacted": bool(pii_counts),
        "pii_types_found": list(pii_counts.keys()),
        "llm_response": llm_response,
        "warning": (
            "⚠️ High-risk content detected."
            if risk_report["level"] == "HIGH_RISK" else None
        ),
    }
