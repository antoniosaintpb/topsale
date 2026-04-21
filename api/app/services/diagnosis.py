from __future__ import annotations

import json
from typing import Any
from uuid import UUID

from sqlalchemy.orm import Session, selectinload

from app.agents.orchestrator import generate_multi_agent_report
from app.models import AgentReport, Lead, LeadStatus, OwnerNotification
from app.services.intake import INTAKE_QUESTIONS


def _lead_context_blob(lead: Lead) -> dict[str, Any]:
    answers: list[dict[str, Any]] = []
    for idx, entry in enumerate(lead.context_entries):
        question = INTAKE_QUESTIONS[idx] if idx < len(INTAKE_QUESTIONS) else f"Q{idx+1}"
        answers.append({"question": question, "answer": entry.payload})
    return {
        "lead": {
            "id": str(lead.id),
            "name": lead.name,
            "niche": lead.niche,
            "team_size": lead.team_size,
            "problem": lead.problem,
            "telegram_username": lead.telegram_username,
            "phone": lead.phone,
        },
        "answers": answers,
    }


def fallback_demo_report(lead: Lead) -> dict[str, Any]:
    return {
        "executive_summary": (
            f"Демо-отчет без LLM: для {lead.name} в нише '{lead.niche}' видна типичная проблема узкого места "
            "между лидогенерацией и закрытием сделки. Для точности нужны реальные метрики воронки."
        ),
        "top_problems": [
            {
                "title": "Нет единой воронки и контроля этапов",
                "why": "Без CRM/стандартов теряется конверсия между этапами.",
                "evidence": "Гипотеза по описанию проблемы клиента.",
            },
            {
                "title": "Слабая квалификация лидов",
                "why": "Менеджеры тратят время на нецелевые диалоги.",
                "evidence": "Гипотеза, если нет явной методики ICP/BANT.",
            },
        ],
        "actions": [
            {
                "priority": "P0",
                "title": "Зафиксировать воронку и SLA по этапам",
                "how": "5-7 этапов, чеклист квалификации, ежедневный контроль конверсий.",
                "owner": "Руководитель продаж",
                "timeframe_days": 7,
            },
            {
                "priority": "P1",
                "title": "Внедрить CRM-дискipline",
                "how": "Обязательные поля, статусы, причины проигрыша, отчеты.",
                "owner": "Ops/CRM админ",
                "timeframe_days": 14,
            },
        ],
        "metric_forecast": [
            {
                "metric": "Конверсия лид -> сделка",
                "current_guess": "неизвестно",
                "target_30d": "+10-20% относительно базы (если база есть)",
                "confidence": "low",
            }
        ],
        "risks": [
            {
                "risk": "Недостаточно данных для точного прогноза",
                "mitigation": "Собрать 2-4 недели фактических метрик и повторить диагностику.",
            }
        ],
        "mode": "fallback_demo",
    }


def create_diagnosis_for_lead(db: Session, lead_id: UUID) -> AgentReport:
    lead = (
        db.query(Lead)
        .options(selectinload(Lead.context_entries))
        .filter(Lead.id == lead_id)
        .first()
    )
    if not lead:
        raise ValueError("Lead not found")

    if len(lead.context_entries) < len(INTAKE_QUESTIONS):
        raise ValueError("Lead context is incomplete")

    try:
        report_payload = generate_multi_agent_report(lead)
        report_payload["llm"] = {"provider": "yandexgpt", "mode": "multi_agent", "status": "ok"}
    except Exception as exc:  # noqa: BLE001
        report_payload = fallback_demo_report(lead)
        report_payload["llm"] = {"provider": "yandexgpt", "mode": "multi_agent", "status": "error", "error": str(exc)}

    report = AgentReport(lead_id=lead.id, report_payload=report_payload)
    db.add(report)

    lead.status = LeadStatus.DIAGNOSIS_READY
    db.add(lead)

    db.commit()
    db.refresh(report)
    return report


def maybe_notify_owner(db: Session, lead_id: UUID, summary: str) -> None:
    from app.config import settings

    if not settings.telegram_owner_bot_token or not settings.owner_telegram_chat_id:
        return

    note = OwnerNotification(
        lead_id=lead_id,
        sent_to_chat_id=int(settings.owner_telegram_chat_id),
        message=summary,
    )
    db.add(note)
    db.commit()
