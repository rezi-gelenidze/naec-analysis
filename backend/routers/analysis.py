from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

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
        session: AsyncSession = Depends(db.get_db)
):
    try:
        scaled_points = await analysis_service.calculate_scaled_points(data.points, session)

        grants = await analysis_service.check_grant_status(scaled_points, session)
        enrollments = [
            await analysis_service.check_enrollment_status(scaled_points, faculty, session)
            for faculty in data.faculties
        ]

        return analysis_models.AnalyzeResponse(
            grants=grants,
            enrollments=enrollments
        )
    except Exception as e:
        print(f"Error during analysis: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

