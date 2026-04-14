from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.domain import Job
from app.schemas.domain import JobCreate, JobResponse, JobUpdate

router = APIRouter()

@router.post("/", response_model=JobResponse)
def create_job(
    job_in: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = Job(
        user_id=current_user.id,
        company_name=job_in.company_name,
        role=job_in.role,
        comments=job_in.comments,
        status=job_in.status
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.get("/", response_model=List[JobResponse])
def get_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    jobs = db.query(Job).filter(Job.user_id == current_user.id).order_by(Job.id.desc()).all()
    return jobs

from datetime import datetime

@router.put("/{job_id}", response_model=JobResponse)
def update_job_status(
    job_id: int,
    status_update: JobUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = db.query(Job).filter(Job.id == job_id, Job.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    if status_update.status is not None:
        if job.status != status_update.status:
            # User wants the date to jump forward to today whenever it's moved
            job.created_at = datetime.utcnow()
        job.status = status_update.status
        
    if status_update.comments is not None:
        job.comments = status_update.comments
        
    db.commit()
    db.refresh(job)
    return job

@router.delete("/{job_id}", response_model=dict)
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = db.query(Job).filter(Job.id == job_id, Job.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    db.delete(job)
    db.commit()
    return {"status": "success", "message": "Job deleted"}
