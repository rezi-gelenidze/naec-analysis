import psycopg2
import psycopg2.extras

from backend import config

from psycopg2.pool import SimpleConnectionPool

db_pool = SimpleConnectionPool(
    minconn=config.DB_MIN_CONNECTIONS,
    maxconn=config.DB_MAX_CONNECTIONS,
    dsn=config.DATABASE_URL
)

def get_db():
    """
    FastAPI dependency to get a database connection from the pool.
    This will be injected into your route functions.
    """
    conn = None
    try:
        conn = db_pool.getconn()
        # Using DictCursor to get results as dictionaries
        cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        yield cursor
        conn.commit() # Commit the transaction
    except Exception as e:
        print(f"Database error: {e}")
        if conn:
            conn.rollback() # Rollback on error
        raise
    finally:
        if conn:
            # Return the connection to the pool instead of closing it.
            cursor.close()
            db_pool.putconn(conn)