"""
app/models/academic.py — Pydantic schemas for structured Study Mode outputs.
Each class enforces the exact academic format the LLM must return.
"""

from pydantic import BaseModel, Field
from typing import List


class TwoMarkAnswer(BaseModel):
    """Format for 2-mark short answer questions."""
    title: str
    points: List[str] = Field(..., min_length=2, max_length=5, description="2–5 concise answer points")


class ThirteenMarkAnswer(BaseModel):
    """Format for 13-mark detailed essay questions."""
    introduction: str
    diagram_description: str = Field(..., description="Text/ASCII diagram description")
    explanation_points: List[str] = Field(..., min_length=6, description="Minimum 6 core technical points")
    advantages: List[str]
    conclusion: str


class MCQOption(BaseModel):
    label: str   # A, B, C, D
    text: str


class MCQ(BaseModel):
    """Multiple Choice Question format."""
    question: str
    options: List[MCQOption]
    correct_option: str
    explanation: str


class CaseStudy(BaseModel):
    """Case study / scenario answer format."""
    title: str
    problem_statement: str
    analysis: str
    proposed_solution: str
    recommendations: List[str]
