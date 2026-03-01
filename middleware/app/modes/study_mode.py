"""
app/modes/study_mode.py — Structured academic output handler.
Forces Gemini to return Pydantic-validated academic JSON with retry logic.
"""

import logging
from typing import Optional
from app.models.academic import TwoMarkAnswer, ThirteenMarkAnswer, MCQ, CaseStudy
from app.core.llm import call_llm_json

logger = logging.getLogger(__name__)

_SCHEMA_MAP = {
    "13_mark":    (ThirteenMarkAnswer, "Answer this 13-mark question: intro, diagram, 6+ points, advantages, conclusion."),
    "mcq":        (MCQ,               "Generate a 4-option MCQ, mark correct answer, add explanation."),
    "case_study": (CaseStudy,         "Write a case study: title, problem, analysis, solution, recommendations."),
    "2_mark":     (TwoMarkAnswer,     "Answer this 2-mark question concisely with 2–5 bullet points."),
}

def _select(message: str) -> str:
    m = message.lower()
    if "13 mark" in m or "long answer" in m or "explain in detail" in m: return "13_mark"
    if "mcq" in m or "multiple choice" in m: return "mcq"
    if "case study" in m: return "case_study"
    return "2_mark"


async def handle_study_mode(message: str, session_id: str) -> dict:
    template = _select(message)
    schema, system_prompt = _SCHEMA_MAP[template]
    logger.info(f"[StudyMode] template={template} session={session_id}")

    raw = await call_llm_json(message, system_instruction=system_prompt, schema=schema)

    for attempt in range(1, 3):
        try:
            validated = schema(**raw)
            return {"type": "structured_academic_response", "template": template,
                    "content": validated.model_dump(), "attempts": attempt}
        except Exception as e:
            logger.warning(f"[StudyMode] Validation failed attempt {attempt}: {e}")
            if attempt < 2:
                raw = await call_llm_json(
                    f"Previous JSON was invalid ({e}). Retry: {message}",
                    system_instruction=system_prompt, schema=schema
                )
    return {"error": "Could not generate valid academic response", "raw": raw}
