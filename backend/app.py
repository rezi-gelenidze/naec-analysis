from flask import Flask, request, jsonify
import sqlite3
import config

import analysis

app = Flask(__name__)

# pagination limit
limit = 10

@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
    return response


@app.route("/faculties", methods=["GET"])
def get_faculties():
    page = int(request.args.get("page", 1))

    university = request.args.get("university", "").lower()
    faculty = request.args.get("faculty", "").lower()
    year = request.args.get("year", "").lower()
    subjects = request.args.getlist("subjects[]")


    # Add subject filtering to WHERE clause
    if not subjects:
        # No subjects provided, return empty result
        return jsonify({"items": [], "total": 0, "limit": limit})

    offset = (page - 1) * limit

    conn = sqlite3.connect(config.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Prepare base WHERE clause
    base_conditions = "1=1"
    params = []

    # Filter 0: Year filtering
    if year != "":
        # Validate year format
        if not year.isdigit() or len(year) != 4:
            return jsonify({"error": "Invalid year format"}), 400
        year = int(year)

        base_conditions += " AND year = ?"
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
        base_conditions += " AND (LOWER(university_name) LIKE ? OR university_id LIKE ?)"
        params.extend([f"%{university}%", f"%{university}%"])
    if faculty:
        base_conditions += " AND (LOWER(faculty_name) LIKE ? OR faculty_id LIKE ?)"
        params.extend([f"%{faculty}%", f"%{faculty}%"])

    # Filter 4: Add subjects filtering
    for s in subjects:
        base_conditions += " AND subjects LIKE ?"
        params.append(f"%{s}%")

    # Main paginated query
    full_query = f"""
        SELECT
            *,
            COUNT(*) OVER() AS total_count
        FROM faculties_materialized_view
        WHERE {base_conditions}
        LIMIT ? OFFSET ?
    """
    params.extend([limit, offset])
    cursor.execute(full_query, params)
    rows = cursor.fetchall()

    # Extract total count window function result
    total_count = rows[0]['total_count'] if rows else 0

    results = []
    for row in rows:
        # Strict check: must contain all query subjects
        results.append({
            "year": row["year"],
            "faculty_id": row["faculty_id"],
            "faculty_name": row["faculty_name"],
            "university_id": row["university_id"],
            "university_name": row["university_name"],
            "subjects": row["subjects"].split(","),
        })

    conn.close()

    return jsonify({
        "items": results,
        "total": total_count,
        "limit": limit
    })


@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()

    points = data.get("points")
    faculties = data.get("faculties", [])

    # Step 1: Validate and preprocess
    if not points:
        return jsonify({"error": "Missing subject scores"}), 400

    # Replace _ with " " in keys
    points = {k.replace("_", " "): v for k, v in points.items()}

    # Check if combination is allowed
    chosen_subjects = set(points.keys())
    if chosen_subjects not in config.ALLOWED_SUBJECT_COMBINATIONS:
        return jsonify({"error": "Invalid subject combination"}), 400

    # Convert raw points to percentages
    percentages = {
        subject: round(score / config.SUBJECT_POINTS[subject], 3)
        for subject, score in points.items()
    }

    # Create reusable connection cursor
    conn = sqlite3.connect(config.DATABASE_PATH)
    cursor = conn.cursor()

    # Step 2: Start the analysis
    try:
        # 1. Calculate scaled scores for calculating both grants and enrollments
        scaled_points = analysis.calculate_scaled_points(percentages, cursor)

        # 2. Check grant results
        grant_results = analysis.check_grant_status(scaled_points, cursor)

        # 3. Check enrollment per faculty
        enrollment_results = [
            analysis.check_enrollment_status(scaled_points, faculty, chosen_subjects, cursor)
            for faculty in faculties
        ]

        # Pack the analysis results and return JSON
        return jsonify({
            "grants": grant_results,
            "enrollments": enrollment_results
        })

    except Exception as e:
        print(f"Error during analysis: {e}")
        return "Internal Server Error", 500

    finally:
        cursor.close()
        conn.close()


if __name__ == '__main__':
    app.run(debug=True)
