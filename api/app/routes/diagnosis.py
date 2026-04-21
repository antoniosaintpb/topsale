from uuid import UUID

import asyncio

from aiogram import Bot
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import AgentReport, Lead
from app.services.diagnosis import create_diagnosis_for_lead, maybe_notify_owner

router = APIRouter(prefix="/leads", tags=["diagnosis"])


async def _send_owner_message(text: str, keyboard: InlineKeyboardMarkup | None = None) -> None:
    bot = Bot(token=settings.telegram_owner_bot_token)
    try:
        await bot.send_message(
            chat_id=int(settings.owner_telegram_chat_id),
            text=text,
            reply_markup=keyboard,
        )
    finally:
        await bot.session.close()


@router.post("/{lead_id}/diagnose")
def diagnose_lead(lead_id: UUID, db: Session = Depends(get_db)):
    try:
        report = create_diagnosis_for_lead(db, lead_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    summary = (
        f"Новая диагностика готова\n"
        f"Lead: {lead.name} ({lead.niche})\n"
        f"id: {lead.id}\n"
        f"Статус LLM: {report.report_payload.get('llm', {})}"
    )

    maybe_notify_owner(db, lead_id, summary)

    if settings.telegram_owner_bot_token and settings.owner_telegram_chat_id:
        try:
            owner_url = f"{settings.web_base_url.rstrip('/')}/owner/lead/{lead.id}"
            keyboard = InlineKeyboardMarkup(
                inline_keyboard=[
                    [
                        InlineKeyboardButton(text="В работе", callback_data=f"status:in_work:{lead.id}"),
                        InlineKeyboardButton(text="Связался", callback_data=f"status:contacted:{lead.id}"),
                    ],
                    [
                        InlineKeyboardButton(text="Консультация", callback_data=f"status:diagnosis_ready:{lead.id}"),
                    ],
                    [InlineKeyboardButton(text="Открыть в web", url=owner_url)],
                ]
            )
            asyncio.run(_send_owner_message(summary, keyboard))
        except Exception:
            # Owner notification must not break diagnosis creation
            pass

    return {"lead_id": str(lead_id), "report_id": report.id, "report": report.report_payload}


@router.get("/{lead_id}/report")
def latest_report(lead_id: UUID, db: Session = Depends(get_db)):
    report = (
        db.query(AgentReport)
        .filter(AgentReport.lead_id == lead_id)
        .order_by(AgentReport.id.desc())
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"lead_id": str(lead_id), "report": report.report_payload}
