import sys

from sqlalchemy import text
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routers import faculties, analysis
from backend import config

from backend.db import engine


@asynccontextmanager
async def lifespan(_: FastAPI):
    """
    Handles startup and shutdown events for the FastAPI application.
    Initializes and disposes of the database connection pool.
    """
    print("Application starting up... Initializing database pool.")
    try:
        async with engine.connect() as connection:
            await connection.execute(text("SELECT 1"))
        print("Database connection test successful.")
    except Exception as e:
        print(f"ERROR: Database connection test failed during startup: {e}")
        sys.exit(1)

    yield

    print("Application shutting down... Disposing database engine.")
    await engine.dispose()


app = FastAPI(lifespan=lifespan)

app.include_router(faculties.router, prefix="/faculties", tags=["Faculties"])
app.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
