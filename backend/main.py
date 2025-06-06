from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from backend.routers import faculties, analysis
from backend import config

app = FastAPI()

app.include_router(faculties.router, prefix="/faculties", tags=["Faculties"])
app.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


