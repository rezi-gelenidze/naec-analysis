from typing import List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from backend import config
from backend.models import faculties as faculties_models


async def search_faculties(
        session: AsyncSession,
        subjects: List[str],
        filters: faculties_models.FacultyQueryFilters,
) -> Tuple[List[faculties_models.FacultyItem], int]:
    offset = (filters.page - 1) * config.LIMIT_PER_PAGE

    base_conditions = "1=1"
    params: Dict[str, Any] = {}

    year: int | None = filters.year
    university: str = filters.university
    faculty: str = filters.faculty

    if year is not None:
        year = int(year)
        base_conditions += " AND year = :year_param"
        params["year_param"] = year

    if len(subjects) == 2:
        base_conditions += " AND elective_count > 0 AND required_count = 3"
    else:
        base_conditions += " AND (required_count = total_subjects_count OR (required_count = 2 AND elective_count > 0))"

    if university:
        base_conditions += " AND (LOWER(university_name) LIKE :university_like_1 OR university_id LIKE :university_like_2)"
        params["university_like_1"] = f"%{university}%"
        params["university_like_2"] = f"%{university}%"
    if faculty:
        base_conditions += " AND (LOWER(faculty_name) LIKE :faculty_like_1 OR faculty_id LIKE :faculty_like_2)"
        params["faculty_like_1"] = f"%{faculty}%"
        params["faculty_like_2"] = f"%{faculty}%"

    subject_conditions = []
    for i, s in enumerate(subjects):
        param_name = f"subject_like_{i}"
        subject_conditions.append(f"subjects LIKE :{param_name}")
        params[param_name] = f"%{s}%"
    if subject_conditions:
        base_conditions += " AND (" + " AND ".join(subject_conditions) + ")"

    full_query = f"""
        SELECT
            *,
            COUNT(*) OVER() AS total_count
        FROM faculties_materialized_view
        WHERE {base_conditions}
        ORDER BY faculty_id, year ASC
        LIMIT :limit_param OFFSET :offset_param
    """

    params["limit_param"] = config.LIMIT_PER_PAGE
    params["offset_param"] = offset

    result = await session.execute(text(full_query), params)
    rows = result.mappings().fetchall()

    total = rows[0]['total_count'] if rows else 0

    items = []
    for row in rows:
        subjects_list = row["subjects"].split(",") if row["subjects"] else []

        items.append(faculties_models.FacultyItem(
            year=row["year"],
            faculty_id=row["faculty_id"],
            faculty_name=row["faculty_name"],
            university_id=row["university_id"],
            university_name=row["university_name"],
            subjects=subjects_list
        ))

    return items, total