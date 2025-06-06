from typing import Dict
from psycopg2.extras import DictCursor

from backend.models.analysis import EnrollmentResult, YearlyGrantResult, SubjectGrant
from backend.toolkit import query_helpers


def calculate_scaled_points(points: Dict[str, float], cursor: DictCursor):
    taken_subjects = tuple(points.keys())
    placeholders = ",".join(["%s"] * len(taken_subjects))

    query = f"""
        SELECT subject_name, year, mean, standard_deviation, max_score
        FROM exam
        WHERE subject_name IN ({placeholders})
        """

    cursor.execute(query, taken_subjects)
    exam_data = cursor.fetchall()

    scaled_scores = {}  # year -> {subject -> scaled_score}
    for subject_name, year, mean, stddev, max_score in exam_data:
        # Some year max points differ, so we take current years percentage * target year max points
        taken_point = points[subject_name] * max_score
        scaled = 15 * ((taken_point - mean) / stddev) + 150
        scaled_scores.setdefault(year, {})[subject_name] = round(scaled, 2)

    return scaled_scores


def check_grant_status(scaled_points_by_year, cursor: DictCursor):
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

            cursor.execute("""
                SELECT grant_amount
                FROM "grant"
                WHERE grant_score < %s
                  AND subject_name = %s
                  AND year = %s
                ORDER BY grant_score DESC
                LIMIT 1
            """, (grant_score, subject, year))
            row = cursor.fetchone()
            grant_amount = row[0] if row else 0

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


def check_enrollment_status(scaled_points_by_year, faculty, cursor: DictCursor):
    faculty_id, year = faculty.faculty_id, faculty.year
    scaled_scores = scaled_points_by_year[year]
    subjects = list(scaled_scores.keys())

    weights = query_helpers.get_faculty_subject_weights(cursor, faculty_id, year, subjects)

    if len(weights) != len(subjects):
        raise ValueError("Mismatch between given subjects and faculty offered subjects.")

    elected_subject = query_helpers.extract_elected_subject(set(subjects))

    # Step 1: Calculate contest score for enrollment
    contest_score = query_helpers.compute_contest_score(scaled_scores, weights)

    # Step 2: Check rank in the enrollment rating and total enrolled
    total_enrolled, rank = query_helpers.get_total_enrolled_and_rank(cursor, faculty_id, year, contest_score,
                                                                     elected_subject)

    # Step 3: Get metadata of that year enrollment
    total_available = query_helpers.get_total_capacity(cursor, faculty_id, year)
    seats_with_subject = query_helpers.get_seats_with_subject(weights, total_available)
    thresholds = query_helpers.get_enrollment_thresholds(faculty_id, year, elected_subject, cursor)

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
