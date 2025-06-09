import os

# Database connection settings
DATABASE_URL = os.environ.get('DATABASE_URL')

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set.")

DB_POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "15"))  # Base connections
DB_MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "5")) # Temporary extra connections
DB_POOL_TIMEOUT = int(os.getenv("DB_POOL_TIMEOUT", "30")) # How long to wait for a connection
DB_POOL_RECYCLE = int(os.getenv("DB_POOL_RECYCLE", "3600")) # Recycle connections every hour

# Pagination
LIMIT_PER_PAGE = 10


# CORS settings
ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://calculator.qbit.ge",
    "https://api.qbit.ge"
]


