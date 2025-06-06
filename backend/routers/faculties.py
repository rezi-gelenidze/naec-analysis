from fastapi import APIRouter, Depends, Query, HTTPException
from psycopg2.extras import DictCursor

from backend import db, config

from backend.services import faculties as faculties_service
from backend.models import faculties as faculties_models

router = APIRouter()


@router.get(
    "",
    response_model=faculties_models.PaginatedFacultyResponse,
    summary="Search for Faculties with Pagination"
)
async def get_faculties(
    filters: faculties_models.FacultyQueryFilters = Depends(),
    subjects: str = Query(..., description="Comma-separated subject list (e.g. MATH,PHYSICS)"),
    db_cursor: DictCursor = Depends(db.get_db)
):
    """
    Search for faculties based on various filter criteria.

    - **subjects**: Must provide at least one subject.
    - **university name/id, faculty name/id, year**: Optional filters.
    - **page**: Page number for pagination.
    """

    # Manually parse subjects from the query string
    subjects = [s.strip() for s in subjects.split(",") if s.strip()]
    if len(subjects) not in (1, 2):
        raise HTTPException(
            status_code=400,
            detail="Subjects must be provided as a comma-separated list with at least one subject."
        )

    # Delegate calculation to service layer
    items, total = faculties_service.search_faculties(
        db_cursor=db_cursor,
        subjects=subjects,
        filters=filters
    )

    return faculties_models.PaginatedFacultyResponse(
        items=items,
        total=total,
        limit=config.LIMIT_PER_PAGE,
    )