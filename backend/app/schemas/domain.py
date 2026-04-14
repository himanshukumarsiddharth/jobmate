from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from datetime import datetime

class JobCreate(BaseModel):
    company_name: str
    role: str
    comments: Optional[str] = ""
    status: Optional[str] = "applied"

class JobUpdate(BaseModel):
    status: Optional[str] = None
    comments: Optional[str] = None

class JobResponse(JobCreate):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class MatchEphemeralRequest(BaseModel):
    resume_skills: List[str]
    job_description: str

class MatchResponse(BaseModel):
    score: float
    missing_keywords: List[str]

