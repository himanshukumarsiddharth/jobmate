import os
import secrets
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Dict, Any

router = APIRouter()

UPLOAD_DIR = "uploads/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    file_id = secrets.token_hex(4)
    file_path = os.path.join(UPLOAD_DIR, f"ephemeral_{file_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
        
    from app.services.ai_service import extract_text_from_pdf, parse_resume_content
    
    raw_text = extract_text_from_pdf(file_path)
    parsed_data = parse_resume_content(raw_text)
    
    # We delete the file locally to ensure no tracking/storage
    if os.path.exists(file_path):
        os.remove(file_path)
        
    return {
        "id": "ephemeral",
        "parsed_data": parsed_data
    }
