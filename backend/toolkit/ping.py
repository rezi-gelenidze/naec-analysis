import asyncio
from backend.db import db_pool


async def keep_db_alive():
    """
    Periodically sends a keep-alive ping to the database to prevent cooling down of connections.
    """
    while True:
        conn = None
        cursor = None
        try:
            conn = db_pool.getconn()
            cursor = conn.cursor()
            cursor.execute("SELECT 1;")
            conn.commit()
            print("Keep-alive ping sent.")
        except Exception as e:
            print("Keep-alive failed:", e)
            if conn:
                conn.rollback()
        finally:
            if cursor:
                cursor.close()
            if conn:
                db_pool.putconn(conn)
        await asyncio.sleep(240)