from __future__ import annotations

import json
import re
from typing import Any

from app.agents.prompts import (
    agent_action_plan_prompt,
    agent_metrics_impact_prompt,
    agent_process_audit_prompt,
    agent_risk_review_prompt,
    editor_final_report_prompt,
)
from app.llm.yandex_gpt import extract_text_from_completion, yandex_gpt_complete_json
from app.models import Lead
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


def _parse_json_lenient(text: str) -> dict[str, Any]:
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s*```$", "", text, flags=re.IGNORECASE)

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    start = text.find("{")
    end = text.rfind("}")
    if start >= 0 and end > start:
        snippet = text[start : end + 1]
        return json.loads(snippet)

    raise json.JSONDecodeError("Unable to parse JSON", text, 0)


def _run_agent(name: str, system: str, user: str, temperature: float) -> dict[str, Any]:
    raw = yandex_gpt_complete_json(
        messages=[{"role": "system", "text": system}, {"role": "user", "text": user}],
        temperature=temperature,
    )
    text = extract_text_from_completion(raw).strip()
    return {"name": name, "raw_text": text, "json": _parse_json_lenient(text)}


def generate_multi_agent_report(lead: Lead) -> dict[str, Any]:
    context = _lead_context_blob(lead)

    process = _run_agent("process_audit", *agent_process_audit_prompt(context), temperature=0.15)
    metrics = _run_agent("metrics_impact", *agent_metrics_impact_prompt(context), temperature=0.2)
    plan = _run_agent("action_plan", *agent_action_plan_prompt(context), temperature=0.2)
    risks = _run_agent("risk_review", *agent_risk_review_prompt(context), temperature=0.15)

    drafts = {
        "process_audit": process["json"],
        "metrics_impact": metrics["json"],
        "action_plan": plan["json"],
        "risk_review": risks["json"],
    }

    editor_raw = yandex_gpt_complete_json(
        messages=[
            {"role": "system", "text": editor_final_report_prompt(context, drafts)[0]},
            {"role": "user", "text": editor_final_report_prompt(context, drafts)[1]},
        ],
        temperature=0.1,
    )
    editor_text = extract_text_from_completion(editor_raw).strip()
    final_json = _parse_json_lenient(editor_text)

    return {
        **final_json,
        "agents": {
            "process_audit": process,
            "metrics_impact": metrics,
            "action_plan": plan,
            "risk_review": risks,
        },
    }
