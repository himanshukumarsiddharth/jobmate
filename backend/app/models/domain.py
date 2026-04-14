from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
from app.core.database import Base

class Job(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    company_name = Column(String, index=True)
    role = Column(String)
    comments = Column(Text, nullable=True)
    status = Column(String, default="applied")  # applied, interview scheduled, rejected, selected
    created_at = Column(DateTime, default=datetime.utcnow)
