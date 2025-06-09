from typing import Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from backend.models.analysis import EnrollmentResult, YearlyGrantResult, SubjectGrant, FacultyData
from backend.toolkit import query_helpers


async def calculate_scaled_points(points: Dict[str, float], session: AsyncSession):
    taken_subjects = tuple(points.keys())

    query = text("""
        SELECT subject_name, year, mean, standard_deviation, max_score
        FROM exam
        WHERE subject_name = ANY (:taken_subjects)
        """)

    result = await session.execute(query, {
        "taken_subjects": taken_subjects
    })
    exam_data = result.mappings().fetchall()

    scaled_scores = {}  # each_year -> {subject -> scaled_score}
    for row in exam_data:
        subject_name = row['subject_name']
        year = row['year']
        mean = row['mean']
        stddev = row['standard_deviation']
        max_score = row['max_score']

        # Some year max points differ, so we take current years percentage * target year max points
        taken_point = points[subject_name] * max_score
        scaled = 15 * ((taken_point - mean) / stddev) + 150
        scaled_scores.setdefault(year, {})[subject_name] = round(scaled, 2)

    return scaled_scores


async def check_grant_status(scaled_points_by_year, session: AsyncSession):
    results = []
    for year, subject_scores in scaled_points_by_year.items():
        geo = subject_scores.get("GEORGIAN LANGUAGE", 0)
        foreign = subject_scores.get("FOREIGN LANGUAGE", 0)

        grant_subjects = {
            s: score for s, score in subject_scores.items()
            if s not in {"GEORGIAN LANGUAGE", "FOREIGN LANGUAGE"}
        }

        all_grants = []
        for subject, score in grant_subjects.items():
            grant_score = round((geo + foreign + 1.5 * score) * 10, 2)

            query = text("""
                SELECT grant_amount
                FROM "grant"
                WHERE grant_score < :grant_score
                  AND subject_name = :subject_name
                  AND year = :year
                ORDER BY grant_score DESC
                LIMIT 1
            """)

            result = await session.execute(query, {
                "grant_score": grant_score,
                "subject_name": subject,
                "year": year
            })

            grant_amount = result.scalar_one_or_none()
            grant_amount = grant_amount if grant_amount is not None else 0 # Default to 0 if no grant

            all_grants.append(
                SubjectGrant(
                    subject=subject,
                    grant_score=grant_score,
                    grant_amount=grant_amount

                )
            )

        results.append(
            YearlyGrantResult(
                year=year,
                grants=all_grants
            )
        )

    return results


async def check_enrollment_status(
        scaled_points_by_year: Dict[int, Dict[str, float]],
        faculty: FacultyData,
        session: AsyncSession
) -> EnrollmentResult:
    """
    Checks the enrollment status for a given faculty and student's scaled scores.
    Now fully asynchronous, using the refactored query_helpers.
    """
    faculty_id, year = faculty.faculty_id, faculty.year
    scaled_scores = scaled_points_by_year[year]
    subjects = list(scaled_scores.keys())

    weights = await query_helpers.get_faculty_subject_weights(session, faculty_id, year, subjects)

    if len(weights) != len(subjects):
        raise ValueError("Mismatch between given subjects and faculty offered subjects.")

    elected_subject = query_helpers.extract_elected_subject(set(subjects))

    contest_score = query_helpers.compute_contest_score(scaled_scores, weights)

    total_enrolled_rank_data = await query_helpers.get_total_enrolled_and_rank(
        session, faculty_id, year, contest_score, elected_subject
    )
    total_enrolled = total_enrolled_rank_data['total_enrolled']
    rank = total_enrolled_rank_data['rank']

    total_available = await query_helpers.get_total_capacity(session, faculty_id, year)

    seats_with_subject = query_helpers.get_seats_with_subject(weights, total_available)

    thresholds = await query_helpers.get_enrollment_thresholds(faculty_id, year, elected_subject, session)

    return EnrollmentResult(
        faculty_id=faculty_id,
        year=year,
        contest_score=contest_score,
        thresholds=thresholds,
        rank=rank,
        total_enrolled=total_enrolled,
        total_available=total_available,
        seats_with_subject=seats_with_subject
    )