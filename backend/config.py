import os

DATABASE_URL = os.environ.get('DATABASE_URL')

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set.")

DB_MIN_CONNECTIONS = 1
DB_MAX_CONNECTIONS = 10

LIMIT_PER_PAGE = 10

ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://calculator.qbit.ge",
]


