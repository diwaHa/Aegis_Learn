"""
middleware/modes/study_mode.py — PRODUCTION VERSION
Forces Gemini to return structured academic JSON validated by Pydantic.
"""

import logging
from pydantic import BaseModel, Field
from typing import List, Optional
from middleware.core.llm import call_llm_json

logger = logging.getLogger(__name__)


# ── Academic Schemas ──────────────────────────────────────────────────────────

class TwoMarkAnswer(BaseModel):
    title: str
    points: List[str] = Field(..., min_items=2, max_items=5)

class ThirteenMarkAnswer(BaseModel):
    introduction: str
    diagram_description: str
    explanation_points: List[str] = Field(..., min_items=6)
    advantages: List[str]
    conclusion: str

class MCQOption(BaseModel):
    label: str
    text: str

class MCQ(BaseModel):
    question: str
    options: List[MCQOption]
    correct_option: str
    explanation: str

class CaseStudy(BaseModel):
    title: str
    problem_statement: str
    analysis: str
    proposed_solution: str
    recommendations: List[str]


# ── Schema selector ───────────────────────────────────────────────────────────

def _select_schema(message: str):
    m = message.lower()
    if "13 mark" in m or "long answer" in m or "explain in detail" in m:
        return ThirteenMarkAnswer, "13_mark"
    if "mcq" in m or "multiple choice" in m:
        return MCQ, "mcq"
    if "case study" in m:
        return CaseStudy, "case_study"
    return TwoMarkAnswer, "2_mark"


# ── System prompts per format ─────────────────────────────────────────────────

_PROMPTS = {
    "2_mark":   "Answer this 2-mark exam question concisely with 2-5 bullet points.",
    "13_mark":  "Answer this 13-mark exam question: include intro, diagram description, 6+ explanation points, advantages, and conclusion.",
    "mcq":      "Generate an MCQ with 4 options (A/B/C/D), mark the correct one, and explain why.",
    "case_study": "Write a case study answer: title, problem, analysis, proposed solution, and recommendations.",
}


# ── Handler ───────────────────────────────────────────────────────────────────

class StudyModeHandler:
    async def handle(self, message: str, session_id: str) -> dict:
        schema, template_name = _select_schema(message)
        system_instruction = _PROMPTS[template_name]

        logger.info(f"[StudyMode] template={template_name} query='{message[:60]}'")

        # Call LLM, force JSON output matching the schema
        raw_data = await call_llm_json(
            message,
            system_instruction=system_instruction,
            schema=schema
        )

        # Validate with Pydantic (retry in production: call LLM again on failure)
        max_retries = 2
        for attempt in range(1, max_retries + 1):
            try:
                validated = schema(**raw_data)
                return {
                    "type": "structured_academic_response",
                    "template": template_name,
                    "content": validated.dict(),
                    "attempts": attempt,
                }
            except Exception as e:
                logger.warning(f"[StudyMode] Validation failed (attempt {attempt}): {e}")
                if attempt < max_retries:
                    retry_prompt = (
                        f"Your previous JSON was invalid: {e}. "
                        f"Retry the original question: {message}"
                    )
                    raw_data = await call_llm_json(
                        retry_prompt,
                        system_instruction=system_instruction,
                        schema=schema
                    )

        return {"error": "Could not generate valid academic response", "raw": raw_data}


_handler: Optional[StudyModeHandler] = None

async def handle_study_mode(message: str, session_id: str):
    global _handler
    if _handler is None:
        _handler = StudyModeHandler()
    return await _handler.handle(message, session_id)
