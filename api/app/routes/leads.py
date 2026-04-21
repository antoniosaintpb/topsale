from uuid import UUID

import asyncio

from aiogram import Bot
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc
from sqlalchemy.orm import Session, selectinload

from app.config import settings
from app.models import Lead, LeadContext, LeadStatus
from app.schemas import (
    LeadContextCreate,
    LeadCreate,
    LeadRead,
    LeadStatusUpdate,
    LeadSummary,
    StartDiagnosisResponse,
)
from app.services.intake import INTAKE_QUESTIONS, get_next_question
from app.database import get_db

router = APIRouter(prefix="/leads", tags=["leads"])


async def _send_new_lead_to_owner(lead: Lead) -> None:
    bot = Bot(token=settings.telegram_owner_bot_token)
    owner_url = f"{settings.web_base_url.rstrip('/')}/owner/lead/{lead.id}"
    text = (
        "Новая заявка с сайта\n"
        f"id: {lead.id}\n"
        f"Имя: {lead.name}\n"
        f"Ниша: {lead.niche}\n"
        f"Команда: {lead.team_size}\n"
        f"Telegram: {lead.telegram_username or '-'}\n"
        f"Телефон: {lead.phone or '-'}\n"
        f"Проблема: {lead.problem}\n\n"
        f"Открыть: {owner_url}"
    )
    try:
        await bot.send_message(chat_id=int(settings.owner_telegram_chat_id), text=text)
    finally:
        await bot.session.close()


@router.get("", response_model=list[LeadSummary])
def list_leads(limit: int = 50, db: Session = Depends(get_db)):
    safe_limit = max(1, min(limit, 200))
    return db.query(Lead).order_by(desc(Lead.created_at)).limit(safe_limit).all()


@router.post("", response_model=LeadRead)
def create_lead(payload: LeadCreate, db: Session = Depends(get_db)):
    lead = Lead(**payload.model_dump())
    db.add(lead)
    db.commit()
    db.refresh(lead)
    if settings.telegram_owner_bot_token and settings.owner_telegram_chat_id:
        try:
            asyncio.run(_send_new_lead_to_owner(lead))
        except Exception:
            # Owner notification should not block lead creation.
            pass
    return lead


@router.patch("/{lead_id}/status", response_model=LeadRead)
def update_lead_status(lead_id: UUID, payload: LeadStatusUpdate, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    lead.status = payload.status
    db.commit()
    db.refresh(lead)
    return lead


@router.get("/{lead_id}", response_model=LeadRead)
def get_lead(lead_id: UUID, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.post("/{lead_id}/start-diagnosis", response_model=StartDiagnosisResponse)
def start_diagnosis(lead_id: UUID, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    lead.status = LeadStatus.CONTEXT_COLLECTING
    db.commit()
    return StartDiagnosisResponse(
        lead_id=lead.id,
        status=lead.status,
        message="Диагностика запущена. Бот продолжит сбор контекста в Telegram.",
    )


@router.post("/{lead_id}/context")
def add_lead_context(lead_id: UUID, payload: LeadContextCreate, db: Session = Depends(get_db)):
    lead = (
        db.query(Lead)
        .options(selectinload(Lead.context_entries))
        .filter(Lead.id == lead_id)
        .first()
    )
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    entry = LeadContext(lead_id=lead.id, source=payload.source, payload=payload.payload)
    db.add(entry)
    db.flush()
    db.refresh(lead)

    context_count = len(lead.context_entries)
    has_next = context_count < len(INTAKE_QUESTIONS)
    lead.status = LeadStatus.CONTEXT_COLLECTING if has_next else LeadStatus.DIAGNOSIS_READY
    db.commit()

    return {
        "lead_id": str(lead.id),
        "status": lead.status.value,
        "context_count": context_count,
        "next_question": get_next_question(lead),
    }
