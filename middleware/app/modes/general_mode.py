"""
app/modes/general_mode.py — Privacy-first LLM pipeline.
spaCy NER + regex redaction → Risk scoring → Real LLM call → Encrypted audit log.
"""

import re, hashlib, json, logging, os
from datetime import datetime, timezone
from typing import Dict, Tuple, Any, List

logger = logging.getLogger(__name__)

# ── spaCy ──────────────────────────────────────────────────────────────────────
try:
    import spacy
    _nlp = spacy.load("en_core_web_sm")
    _SPACY = True
except (ImportError, OSError):
    _nlp = None; _SPACY = False
    logger.warning("[Privacy] spaCy unavailable — regex-only PII detection active.")

# ── MongoDB ────────────────────────────────────────────────────────────────────
try:
    from pymongo import MongoClient
    from app.config import settings as _s
    if _s.MONGODB_URI:
        _col = MongoClient(_s.MONGODB_URI, serverSelectionTimeoutMS=3000)[_s.MONGODB_DB_NAME]["audit_logs"]
        _MONGO = True
    else: raise ValueError("MONGODB_URI not set")
except Exception as e:
    _col = None; _MONGO = False
    logger.warning(f"[Audit] MongoDB unavailable ({e}) — in-memory fallback.")

# ── Fernet ─────────────────────────────────────────────────────────────────────
try:
    from cryptography.fernet import Fernet
    from app.config import settings as _s2
    _fkey = _s2.FERNET_KEY or Fernet.generate_key().decode()
    _fernet = Fernet(_fkey.encode() if isinstance(_fkey, str) else _fkey)
    _FERNET = True
except ImportError:
    _fernet = None; _FERNET = False

# ── PII Regex ──────────────────────────────────────────────────────────────────
_PII = {
    "EMAIL":   r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b",
    "PHONE":   r"\b(?:\+91|0)?[6-9]\d{9}\b",
    "AADHAAR": r"\b\d{4}\s?\d{4}\s?\d{4}\b",
    "PAN":     r"\b[A-Z]{5}[0-9]{4}[A-Z]\b",
    "IP":      r"\b(?:\d{1,3}\.){3}\d{1,3}\b",
    "URL":     r"https?://[^\s]+",
}
_KEYWORDS = {"password":5,"token":4,"secret":4,"api_key":5,"credit card":5,"cvv":5,"otp":4,"pin":3,
             "diagnosis":3,"patient":2,"prescription":3,"account number":4,"ifsc":3}
_POLICIES = {
    "healthcare": {"patterns":[r"\b(?:blood pressure|diabetes|cancer|HIV|diagnosis|prescription)\b"],"mult":2.0},
    "finance":    {"patterns":[r"\b(?:account|balance|transaction|IFSC|SWIFT|loan)\b"],"mult":1.7},
    "legal":      {"patterns":[r"\b(?:case number|FIR|judgment|defendant|plaintiff)\b"],"mult":1.5},
    "general":    {"patterns":[],"mult":1.0},
}


class PIIRedactor:
    def redact(self, text: str, industry: str = "general") -> Tuple[str, Dict[str, int]]:
        out, counts = text, {}
        for label, pat in _PII.items():
            for i, m in enumerate(re.findall(pat, out, re.IGNORECASE), 1):
                out = out.replace(m, f"[{label}_{i}]", 1)
                counts[label] = counts.get(label, 0) + 1
        if _SPACY and _nlp:
            for ent in _nlp(out).ents:
                if ent.label_ in ("PERSON","ORG","GPE"):
                    out = out.replace(ent.text, f"[{ent.label_}]", 1)
                    counts[ent.label_] = counts.get(ent.label_, 0) + 1
        for pat in _POLICIES.get(industry, _POLICIES["general"])["patterns"]:
            for m in re.findall(pat, out, re.IGNORECASE):
                out = re.sub(re.escape(m), "[INDUSTRY_SENSITIVE]", out, flags=re.IGNORECASE)
                counts["INDUSTRY_SENSITIVE"] = counts.get("INDUSTRY_SENSITIVE",0)+1
        return out, counts


class RiskScorer:
    def score(self, text: str, pii_counts: Dict[str, int], industry: str = "general") -> Dict[str, Any]:
        mult = _POLICIES.get(industry, _POLICIES["general"])["mult"]
        pii_sc = sum(c*10 for c in pii_counts.values())
        kw_sc = sum(w for kw, w in _KEYWORDS.items() if kw in text.lower())
        score = min(100, int((pii_sc + kw_sc) * mult))
        lvl = "SAFE" if score<=20 else "MEDIUM_RISK" if score<=60 else "HIGH_RISK"
        return {"score":score,"level":lvl,"display":{"SAFE":"🟢","MEDIUM_RISK":"🟡","HIGH_RISK":"🔴"}[lvl],
                "pii_types_found":list(pii_counts.keys())}


class AuditLogger:
    def __init__(self): self._logs: List[Dict] = []

    def _enc(self, t: str) -> str:
        if _fernet: return _fernet.encrypt(t.encode()).decode()
        import base64; return base64.b64encode(t.encode()).decode()

    def log(self, session_id: str, redacted: str, risk: Dict, industry: str):
        entry = {"timestamp": datetime.now(timezone.utc).isoformat(),
                 "session_hash": hashlib.sha256(session_id.encode()).hexdigest()[:12],
                 "industry": industry, "redacted_encrypted": self._enc(redacted[:1000]),
                 "risk_score": risk["score"], "risk_level": risk["level"],
                 "pii_detected": risk["pii_types_found"]}
        if _MONGO and _col:
            try: _col.insert_one(entry); return
            except Exception as e: logger.error(f"[Audit] MongoDB insert failed: {e}")
        self._logs.append(entry)

    def get_logs(self) -> List[Dict]:
        if _MONGO and _col:
            try: return list(_col.find({},{"_id":0}).sort("timestamp",-1).limit(100))
            except: pass
        return self._logs


_redactor = PIIRedactor()
_scorer   = RiskScorer()
_audit_logger = AuditLogger()


async def handle_general_mode(message: str, session_id: str, industry: str = "general") -> Dict[str, Any]:
    from app.core.llm import call_llm
    redacted, pii = _redactor.redact(message, industry)
    risk = _scorer.score(message, pii, industry)
    _audit_logger.log(session_id, redacted, risk, industry)
    llm_resp = await call_llm(redacted, "You are a helpful assistant. Answer concisely.")
    return {"type":"general_mode_response","risk_report":risk,"pii_redacted":bool(pii),
            "pii_types_found":list(pii.keys()),"llm_response":llm_resp,
            "warning":"⚠️ High-risk content detected." if risk["level"]=="HIGH_RISK" else None}
