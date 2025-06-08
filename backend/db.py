import psycopg2
import psycopg2.extras
from psycopg2.pool import ThreadedConnectionPool
from backend import config


db_pool = ThreadedConnectionPool(
    minconn=config.DB_MIN_CONNECTIONS,
    maxconn=config.DB_MAX_CONNECTIONS,
    dsn=config.DATABASE_URL
)

def get_db():
    """
    FastAPI dependency to get a DB cursor from pool.
    Safely yields a DictCursor and manages commit/rollback.
    """
    conn = None
    cursor = None
    try:
        conn = db_pool.getconn()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        yield cursor
        conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if cursor:
            cursor.close()
        if conn:
            db_pool.putconn(conn)
