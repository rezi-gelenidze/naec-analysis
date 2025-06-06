from typing import List
from psycopg2.extras import DictCursor

from backend import config
from backend.models import faculties as faculties_models


def search_faculties(
        db_cursor: DictCursor,
        subjects: List[str],
        filters: faculties_models.FacultyQueryFilters,
):
    offset = (filters.page - 1) * config.LIMIT_PER_PAGE

    # Prepare base WHERE clause
    base_conditions = "1=1"
    params = []

    year: int | None = filters.year
    university: str = filters.university
    faculty: str = filters.faculty

    # Filter 0: Year filtering
    if year is not None:
        year = int(year)
        base_conditions += " AND year = %s"
        params.append(year)

    # Filter 1: Branch subject based filtering, to avoid subset selection

    # Medical faculties with biology + elective
    if len(subjects) == 2:
        base_conditions += " AND elective_count > 0 AND required_count = 3"
    else:
        # another faculties are all with 1 elective
        base_conditions += " AND (required_count = total_subjects_count OR (required_count = 2 AND elective_count > 0))"

    # Filter 2-3: Add university and faculty filtering
    if university:
        base_conditions += " AND (LOWER(university_name) LIKE %s OR university_id LIKE %s)"
        params.extend([f"%{university}%", f"%{university}%"])
    if faculty:
        base_conditions += " AND (LOWER(faculty_name) LIKE %s OR faculty_id LIKE %s)"
        params.extend([f"%{faculty}%", f"%{faculty}%"])


    # Filter 4: Add subjects filtering
    for s in subjects:
        base_conditions += " AND subjects LIKE %s"
        params.append(f"%{s}%")

    # Main paginated query
    full_query = f"""
        SELECT
            *,
            COUNT(*) OVER() AS total_count
        FROM faculties_materialized_view
        WHERE {base_conditions}
        LIMIT %s OFFSET %s
    """

    params.extend([config.LIMIT_PER_PAGE, offset])
    db_cursor.execute(full_query, params)
    rows = db_cursor.fetchall()

    # Extract total count window function result
    total = rows[0]['total_count'] if rows else 0

    # Serialize the response and return
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
