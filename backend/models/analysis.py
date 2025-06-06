from typing import Dict, List, Optional
from pydantic import BaseModel, Field, model_validator

from backend import constants


class FacultyInput(BaseModel):
    faculty_id: str
    year: int


class AnalyzeRequest(BaseModel):
    points: Dict[str, float] = Field(..., description="Raw exam points by subject")
    faculties: Optional[List[FacultyInput]] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_subject_combination(self):
        chosen_subjects = frozenset(self.points.keys())
        if chosen_subjects not in constants.ALLOWED_SUBJECT_COMBINATIONS:
            raise ValueError("Invalid subject combination")
        return self


class SubjectGrant(BaseModel):
    subject: str
    grant_score: float
    grant_amount: int


class YearlyGrantResult(BaseModel):
    year: int
    grants: List[SubjectGrant]


class EnrollmentResult(BaseModel):
    faculty_id: str
    year: int
    contest_score: float
    thresholds: Dict[str, float]
    rank: int
    total_enrolled: int
    total_available: int
    seats_with_subject: int


class AnalyzeResponse(BaseModel):
    grants: List[YearlyGrantResult]
    enrollments: List[EnrollmentResult]
