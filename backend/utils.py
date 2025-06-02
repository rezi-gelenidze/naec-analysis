def get_grant_thresholds(subject_name, cursor):
    """
    Fetch minimum grant scores for 50%, 70%, and 100% grants as reference.

    :return: List of rows with year, min_grant_50, min_grant_70, and min_grant_100.
    """
    query = f"""
    WITH GrantThresholds AS (
        SELECT
            year,
            MIN(grant_score) FILTER (WHERE grant_amount = 50) AS min_grant_50,
            MIN(grant_score) FILTER (WHERE grant_amount = 70) AS min_grant_70,
            MIN(grant_score) FILTER (WHERE grant_amount = 100) AS min_grant_100
        FROM grant
        WHERE subject_name = "{subject_name}"
        GROUP BY year
    )
    SELECT *
    FROM GrantThresholds
    ORDER BY year;
    """
    cursor.execute(query)
    results = cursor.fetchall()

    return results


def get_enrollment_thresholds(faculty_id, year, subject, cursor):
    """
    Fetch min/max contest scores and total count for a given faculty and year.

    :param faculty_id: Faculty ID.
    :param year: Enrollment year.
    :param subject: Elective subject chosen by the student.
    :param cursor: Database cursor.

    :return: Dict with min_score, max_score, count.
    """
    query = """
        SELECT
            MIN(contest_score),
            MAX(contest_score)
        FROM enrollment e
        JOIN result r ON e.student_id = r.enrollment_id
        WHERE faculty_id = ? AND year = ? AND r.subject_name = ?
    """
    cursor.execute(query, (faculty_id, year, subject))
    row = cursor.fetchone()

    return {
        "faculty_id": faculty_id,
        "year": year,
        "min_score": round(row[0], 2) if row[0] is not None else None,
        "max_score": round(row[1], 2) if row[1] is not None else None,
    }


def get_total_enrolled_and_rank(cursor, faculty_id, year, score, elected_subject):
    cursor.execute("""
        SELECT 
            COUNT(*) as total_enrolled,
            COUNT(*) FILTER (WHERE contest_score > ?) + 1 AS rank
        FROM enrollment e
        JOIN result r ON r.enrollment_id = e.student_id
        WHERE faculty_id = ? AND year = ? AND r.subject_name = ?
    """, (score, faculty_id, year, elected_subject))
    return cursor.fetchone()



def extract_elected_subject(chosen_subjects):
    # If there is 4 subjects then 3 of them are Georgian, Foreign and Biology and fourth is the elective one (medicals)
    if len(chosen_subjects) == 4:
        elective_subjects = chosen_subjects - {"GEORGIAN LANGUAGE", "FOREIGN LANGUAGE", "BIOLOGY"}
    # If there is 3 subjects 2 of them is Georgian and Foreign and third one is elective
    else:
        elective_subjects = chosen_subjects - {"GEORGIAN LANGUAGE", "FOREIGN LANGUAGE"}

    # only one elective subject will be left for check then
    return list(elective_subjects)[0]


def get_faculty_subject_weights(cursor, faculty_id, year, subjects):
    placeholders = ','.join('?' for _ in subjects)
    query = f"""
        SELECT subject_name, weight, seats
        FROM faculty_year_subjects
        WHERE faculty_id = ? AND year = ? AND subject_name IN ({placeholders})
    """

    cursor.execute(query, [faculty_id, year] + subjects)
    return cursor.fetchall()


def get_total_capacity(cursor, faculty_id, year):
    cursor.execute("""
        SELECT capacity
        FROM faculty
        WHERE id = ? AND year = ?
    """, (faculty_id, year))

    return cursor.fetchone()[0]


def compute_contest_score(scaled_scores, weights):
    return round(sum(scaled_scores[s] * w for s, w, _ in weights if s in scaled_scores), 2)


def get_seats_with_subject(weight_rows, fallback_capacity):
    for _, _, seats in weight_rows:
        if seats is not None:
            return seats
    return fallback_capacity
