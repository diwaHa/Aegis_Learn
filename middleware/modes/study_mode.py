"""
middleware/modes/study_mode.py — PRODUCTION VERSION
Forces Gemini to return structured academic JSON validated by Pydantic.
"""

import logging
from pydantic import BaseModel, Field
from typing import List, Optional
from core.llm import call_llm_json

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
    m = message.lower().strip()
    
    # Handle greetings and casual messages - return appropriate response
    greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "thanks", "thank you", "bye", "goodbye"]
    casual = ["how are you", "what's up", "howdy", "yo", "sup", "ok", "okay", "alright", "cool", "nice"]
    
    if any(greeting in m for greeting in greetings) or any(casual in casual):
        logger.info(f"[StudyMode] Detected casual message, returning casual response for: {message[:50]}")
        return "casual", "casual"
    
    # Explicit 13-mark indicators
    if "13 mark" in m or "long answer" in m or "explain in detail" in m:
        logger.info(f"[StudyMode] Selected 13_mark (explicit) for: {message[:50]}")
        return ThirteenMarkAnswer, "13_mark"
    
    # MCQ indicators
    if "mcq" in m or "multiple choice" in m:
        logger.info(f"[StudyMode] Selected mcq for: {message[:50]}")
        return MCQ, "mcq"
    
    # Case study indicators
    if "case study" in m:
        logger.info(f"[StudyMode] Selected case_study for: {message[:50]}")
        return CaseStudy, "case_study"
    
    # Check if it's actually a question (contains question marks or question words)
    question_indicators = ["?", "what", "how", "why", "when", "where", "who", "which", "explain", "describe", "define", "discuss", "analyze", "compare", "evaluate"]
    
    if not any(indicator in m for indicator in question_indicators):
        logger.info(f"[StudyMode] Not a question, returning casual response for: {message[:50]}")
        return "casual", "casual"
    
    # Intelligent detection for detailed academic questions
    detailed_indicators = [
        "explain", "describe", "discuss", "analyze", "compare", "evaluate",
        "what is", "how does", "why is", "when did", "where can", "who are",
        "definition", "meaning", "purpose", "importance", "advantages", "disadvantages",
        "features", "characteristics", "types", "examples", "applications", "principles",
        "impact", "role", "function", "process", "method", "technique", "approach"
    ]
    
    # Check if message contains detailed academic indicators and is substantial
    if any(indicator in m for indicator in detailed_indicators) and len(message.split()) > 2:
        logger.info(f"[StudyMode] Selected 13_mark (academic) for: {message[:50]}")
        return ThirteenMarkAnswer, "13_mark"
    
    # For simple questions, use 2-mark format
    logger.info(f"[StudyMode] Selected 2_mark (simple question) for: {message[:50]}")
    return TwoMarkAnswer, "2_mark"


# ── System prompts per format ─────────────────────────────────────────────────

_PROMPTS = {
    "casual":    "Respond naturally and conversationally to this message. Be friendly and helpful.",
    "2_mark":    "Answer this 2-mark exam question concisely with 2-5 bullet points.",
    "13_mark":   "Answer this 13-mark exam question: include intro, diagram description, 6+ explanation points, advantages, and conclusion.",
    "mcq":       "Generate an MCQ with 4 options (A/B/C/D), mark the correct one, and explain why.",
    "case_study": "Write a case study answer: title, problem, analysis, proposed solution, and recommendations.",
}


# ── Handler ───────────────────────────────────────────────────────────────────

class StudyModeHandler:
    async def handle(self, message: str, session_id: str) -> dict:
        schema, template_name = _select_schema(message)
        system_instruction = _PROMPTS[template_name]

        logger.info(f"[StudyMode] template={template_name} query='{message[:60]}'")

        # Handle casual responses differently
        if template_name == "casual":
            from core.llm import call_llm
            response = await call_llm(message, system_instruction)
            return {
                "type": "casual_response",
                "template": "casual",
                "content": response,
                "attempts": 1,
            }

        # Call LLM, force JSON output matching the schema for academic formats
        raw_data = await call_llm_json(
            message,
            system_instruction=system_instruction,
            schema=schema
        )
        
        logger.info(f"[StudyMode] LLM returned: {type(raw_data)} - {str(raw_data)[:100]}")

        # Validate with Pydantic (retry in production: call LLM again on failure)
        max_retries = 2
        for attempt in range(1, max_retries + 1):
            try:
                logger.info(f"[StudyMode] Validation attempt {attempt}")
                validated = schema(**raw_data)
                result = {
                    "type": "structured_academic_response",
                    "template": template_name,
                    "content": validated.dict(),
                    "attempts": attempt,
                }
                logger.info(f"[StudyMode] Success! Returning: {type(result)}")
                return result
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

        logger.error(f"[StudyMode] All attempts failed, returning error")
        return {"error": "Could not generate valid academic response", "raw": raw_data}


_handler: Optional[StudyModeHandler] = None

async def handle_study_mode(message: str, session_id: str):
    global _handler
    if _handler is None:
        _handler = StudyModeHandler()
    return await _handler.handle(message, session_id)
