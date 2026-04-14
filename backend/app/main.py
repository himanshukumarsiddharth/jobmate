from fastapi import FastAPI
from app.core.config import settings
from app.routers import auth, resume, job, match
from app.core.database import Base, engine
import app.models

# Create the database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(resume.router, prefix="/resume", tags=["resume"])
app.include_router(job.router, prefix="/jobs", tags=["jobs"])
app.include_router(match.router, prefix="/match", tags=["match"])
@app.get("/")
def root():
    return {"message": "Welcome to JobMate Backend API"}
