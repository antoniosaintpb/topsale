from app.models import Lead, LeadContext, LeadStatus

INTAKE_QUESTIONS = [
    "Какая сейчас конверсия из лида в сделку (примерно, в %)?",
    "Сколько лидов в месяц приходит сейчас?",
    "Средний чек одной сделки?",
    "Какая средняя длительность цикла сделки (в днях)?",
    "Используете ли CRM? Если да, какую?",
    "Сколько менеджеров в отделе продаж?",
]


def next_question_index(lead: Lead) -> int:
    return len(lead.context_entries)


def has_more_questions(lead: Lead) -> bool:
    return next_question_index(lead) < len(INTAKE_QUESTIONS)


def get_next_question(lead: Lead) -> str | None:
    index = next_question_index(lead)
    if index >= len(INTAKE_QUESTIONS):
        return None
    return INTAKE_QUESTIONS[index]


def apply_context_entry(lead: Lead, payload: dict) -> LeadContext:
    entry = LeadContext(lead_id=lead.id, source="telegram", payload=payload)
    lead.status = LeadStatus.CONTEXT_COLLECTING if has_more_questions(lead) else LeadStatus.DIAGNOSIS_READY
    return entry
