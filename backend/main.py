import asyncio
import contextlib

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routers import faculties, analysis
from backend.toolkit.ping import keep_db_alive
from backend import config


@contextlib.asynccontextmanager
async def lifespan(_: FastAPI):
    task = asyncio.create_task(keep_db_alive())
    yield
    task.cancel()
    with contextlib.suppress(asyncio.CancelledError):
        await task


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
