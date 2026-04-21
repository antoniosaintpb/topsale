from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.models import LeadStatus


class LeadCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    niche: str = Field(min_length=2, max_length=200)
    team_size: int = Field(ge=1, le=5000)
    problem: str = Field(min_length=10, max_length=4000)
    telegram_username: str | None = Field(default=None, max_length=64)
    phone: str | None = Field(default=None, max_length=32)


class LeadContextCreate(BaseModel):
    source: str = "telegram"
    payload: dict


class StartDiagnosisResponse(BaseModel):
    lead_id: UUID
    status: LeadStatus
    message: str


class LeadRead(BaseModel):
    id: UUID
    name: str
    niche: str
    team_size: int
    problem: str
    telegram_username: str | None
    phone: str | None
    status: LeadStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LeadStatusUpdate(BaseModel):
    status: LeadStatus


class LeadSummary(BaseModel):
    id: UUID
    name: str
    niche: str
    team_size: int
    status: LeadStatus
    created_at: datetime

    class Config:
        from_attributes = True
