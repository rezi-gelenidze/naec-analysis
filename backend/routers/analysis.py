from fastapi import APIRouter, HTTPException, Depends
from psycopg2.extras import DictCursor

from backend import db

from backend.models import analysis as analysis_models
from backend.services import analysis as analysis_service


router = APIRouter()

@router.post(
    "",
    response_model=analysis_models.AnalyzeResponse,
    summary="Analyze grant and enrollment eligibility based on exam scores"
)
async def analyze(
        data: analysis_models.AnalyzeRequest,
        db_cursor: DictCursor = Depends(db.get_db)
):
    try:
        scaled_points = analysis_service.calculate_scaled_points(data.points, db_cursor)

        grants = analysis_service.check_grant_status(scaled_points, db_cursor)
        enrollments = [
            analysis_service.check_enrollment_status(scaled_points, faculty, db_cursor)
            for faculty in data.faculties
        ]

        return analysis_models.AnalyzeResponse(
            grants=grants,
            enrollments=enrollments
        )
    except Exception as e:
        print(f"Error during analysis: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

