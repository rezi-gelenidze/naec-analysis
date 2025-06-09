from typing import List, Dict, Tuple, Any, Set
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text


async def get_grant_thresholds(subject_name: str, session: AsyncSession) -> List[Dict[str, Any]]:
    """
    Fetch minimum grant scores for 50%, 70%, and 100% grants as reference.
    Refactored to use AsyncSession.
    """
    query = text("""
    WITH GrantThresholds AS (
        SELECT
            year,
            MIN(grant_score) FILTER (WHERE grant_amount = 50) AS min_grant_50,
            MIN(grant_score) FILTER (WHERE grant_amount = 70) AS min_grant_70,
            MIN(grant_score) FILTER (WHERE grant_amount = 100) AS min_grant_100
        FROM "grant" -- 'grant' is a SQL keyword, so it's quoted
        WHERE subject_name = :subject_name
        GROUP BY year
    )
    SELECT *
    FROM GrantThresholds
    ORDER BY year;
    """)
    result = await session.execute(query, {"subject_name": subject_name})
    results = result.mappings().fetchall()
    return results


async def get_enrollment_thresholds(faculty_id: str, year: int, subject: str, session: AsyncSession) -> Dict[str, Any]:
    """
    Fetch min/max contest scores for a given faculty and year, using AsyncSession.
    """
    query = text("""
        SELECT
            MIN(contest_score) AS min_score,
            MAX(contest_score) AS max_score
        FROM enrollment e
        JOIN result r ON e.student_id = r.enrollment_id
        WHERE faculty_id = :faculty_id AND year = :year AND r.subject_name = :subject_name
    """)
    result = await session.execute(query, {
        "faculty_id": faculty_id,
        "year": year,
        "subject_name": subject
    })

    row = result.mappings().fetchone()

    if row is None:
        return {
            "faculty_id": faculty_id,
            "year": year,
            "min_score": None,
            "max_score": None,
        }

    return {
        "faculty_id": faculty_id,
        "year": year,
        "min_score": round(row['min_score'], 2) if row['min_score'] is not None else None,
        "max_score": round(row['max_score'], 2) if row['max_score'] is not None else None,
    }


async def get_total_enrolled_and_rank(session: AsyncSession, faculty_id: str, year: int, score: float,
                                      elected_subject: str) -> Dict[str, Any]:
    """
    Fetch total enrolled students and a student's rank, using AsyncSession.
    """
    query = text("""
        SELECT
            COUNT(*) as total_enrolled,
            COUNT(*) FILTER (WHERE contest_score > :score) + 1 AS rank
        FROM enrollment e
        JOIN result r ON r.enrollment_id = e.student_id
        WHERE faculty_id = :faculty_id AND year = :year AND r.subject_name = :elected_subject
    """)
    result = await session.execute(query, {
        "score": score,
        "faculty_id": faculty_id,
        "year": year,
        "elected_subject": elected_subject
    })
    row = result.mappings().fetchone()

    if row is None:
        return {"total_enrolled": 0, "rank": 1}

    return row


async def get_faculty_subject_weights(session: AsyncSession, faculty_id: str, year: int, subjects: List[str]) -> List[
    Dict[str, Any]]:
    """
    Fetch subject weights for a faculty in a given year, using AsyncSession.
    """
    query = text("""
            SELECT subject_name, weight, seats
            FROM faculty_year_subjects
            WHERE faculty_id = :faculty_id AND year = :year AND subject_name = ANY(:subjects)
        """)

    result = await session.execute(query, {
        "faculty_id": faculty_id,
        "year": year,
        "subjects": tuple(subjects)
    })
    return result.mappings().fetchall()


async def get_total_capacity(session: AsyncSession, faculty_id: str, year: int) -> int:
    """
    Fetch the total capacity for a faculty in a given year, using AsyncSession.
    """
    query = text("""
        SELECT capacity
        FROM faculty
        WHERE id = :faculty_id AND year = :year
    """)
    result = await session.execute(query, {
        "faculty_id": faculty_id,
        "year": year
    })
    capacity = result.scalar_one_or_none()
    return capacity if capacity is not None else 0  # Default to 0 if not found


def extract_elected_subject(chosen_subjects: Set[str]) -> str:
    if len(chosen_subjects) == 4:
        elective_subjects = chosen_subjects - {"GEORGIAN LANGUAGE", "FOREIGN LANGUAGE", "BIOLOGY"}
    else:
        elective_subjects = chosen_subjects - {"GEORGIAN LANGUAGE", "FOREIGN LANGUAGE"}

    if not elective_subjects:
        raise ValueError("Could not determine elected subject. Check input subjects.")

    return list(elective_subjects)[0]


def compute_contest_score(scaled_scores: Dict[str, float], weights: List[Dict[str, Any]]) -> float:
    return round(
        sum(
            scaled_scores.get(row['subject_name'], 0.0) * row['weight']
            for row in weights
            if row['subject_name'] in scaled_scores
        ),
        2
    )


def get_seats_with_subject(weight_rows: List[Dict[str, Any]], fallback_capacity: int) -> int:
    for row in weight_rows:
        if row['seats'] is not None:
            return row['seats']
    return fallback_capacity
