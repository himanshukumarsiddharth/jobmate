from fastapi import APIRouter
from app.schemas.domain import MatchEphemeralRequest, MatchResponse
from app.services.ai_service import _extract_skills

router = APIRouter()

@router.post("/ephemeral", response_model=MatchResponse)
def match_resume_ephemeral(request: MatchEphemeralRequest):
    # Request contains resume_skills (list of words) and job_description (raw text)
    resume_skills_set = set(request.resume_skills)
    job_skills_set = _extract_skills(request.job_description)

    if not job_skills_set:
        return {"score": 100.0, "missing_keywords": []}

    matched = resume_skills_set.intersection(job_skills_set)
    score = (len(matched) / len(job_skills_set)) * 100.0
    missing_keywords = sorted(job_skills_set.difference(resume_skills_set))

    return {
        "score": round(score, 2),
        "missing_keywords": missing_keywords
    }
