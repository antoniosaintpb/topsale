from __future__ import annotations

import json
from typing import Any


def strict_json_only_suffix(schema_hint: str) -> str:
    return (
        "Верни строго JSON без markdown и без пояснений до/после JSON.\n"
        f"{schema_hint}\n"
        "Если данных не хватает — помечай поля как гипотезы в тексте полей, не выдумывай точные цифры."
    )


def agent_process_audit_prompt(context_json: dict[str, Any]) -> tuple[str, str]:
    schema = """
{
  "funnel_bottlenecks": [{"stage": string, "issue": string, "signals": string}],
  "process_gaps": [{"gap": string, "impact": string, "fix_direction": string}],
  "crm_hygiene": {"assessment": string, "missing_fields_or_rules": [string]}
}
"""
    system = "Ты эксперт по процессам продаж и воронке B2B/B2C для SMB. Пиши по-русски."
    user = (
        "Проанализируй процесс продаж по входным данным.\n"
        f"{strict_json_only_suffix(schema)}\n\n"
        f"INPUT_JSON:\n{json.dumps(context_json, ensure_ascii=False)}"
    )
    return system, user


def agent_metrics_impact_prompt(context_json: dict[str, Any]) -> tuple[str, str]:
    schema = """
{
  "metrics_to_track": [{"metric": string, "why": string, "how_to_measure": string}],
  "impact_hypotheses": [{"hypothesis": string, "expected_effect": string, "confidence": "low"|"med"|"high"}],
  "quick_wins": [string]
}
"""
    system = "Ты эксперт по метрикам продаж и unit-экономике. Не придумывай точные числа без данных."
    user = (
        "Оцени потенциальный эффект и метрики, которые надо отслеживать.\n"
        f"{strict_json_only_suffix(schema)}\n\n"
        f"INPUT_JSON:\n{json.dumps(context_json, ensure_ascii=False)}"
    )
    return system, user


def agent_action_plan_prompt(context_json: dict[str, Any]) -> tuple[str, str]:
    schema = """
{
  "plan_30d": [{"week": 1|2|3|4, "title": string, "tasks": [string], "success_criteria": string}],
  "playbooks": [{"name": string, "steps": [string]}]
}
"""
    system = "Ты sales ops: планируешь внедрение изменений в отдел продаж за 30 дней."
    user = (
        "Составь план на 30 дней и мини-плейбуки.\n"
        f"{strict_json_only_suffix(schema)}\n\n"
        f"INPUT_JSON:\n{json.dumps(context_json, ensure_ascii=False)}"
    )
    return system, user


def agent_risk_review_prompt(context_json: dict[str, Any]) -> tuple[str, str]:
    schema = """
{
  "risks": [{"risk": string, "likelihood": "low"|"med"|"high", "mitigation": string}],
  "assumptions": [string],
  "questions_for_client": [string]
}
"""
    system = "Ты риск-менеджер внедрения продаж: ищешь слабые места, зависимости, ошибки данных."
    user = (
        "Сделай риск-ревью и список уточняющих вопросов.\n"
        f"{strict_json_only_suffix(schema)}\n\n"
        f"INPUT_JSON:\n{json.dumps(context_json, ensure_ascii=False)}"
    )
    return system, user


def editor_final_report_prompt(
    context_json: dict[str, Any],
    agent_outputs: dict[str, Any],
) -> tuple[str, str]:
    schema = """
{
  "executive_summary": string,
  "top_problems": [{"title": string, "why": string, "evidence": string}],
  "actions": [{"priority": "P0"|"P1"|"P2", "title": string, "how": string, "owner": string, "timeframe_days": number}],
  "metric_forecast": [{"metric": string, "current_guess": string, "target_30d": string, "confidence": "low"|"med"|"high"}],
  "risks": [{"risk": string, "mitigation": string}]
}
"""
    system = (
        "Ты senior sales consultant-editor. Собери финальный отчет для клиента: без воды, "
        "с четкими действиями. Устрани противоречения между агентами."
    )
    user = (
        "Собери финальный JSON отчета на основе входных данных и черновиков агентов.\n"
        f"{strict_json_only_suffix(schema)}\n\n"
        f"INPUT_JSON:\n{json.dumps(context_json, ensure_ascii=False)}\n\n"
        f"AGENT_DRAFTS_JSON:\n{json.dumps(agent_outputs, ensure_ascii=False)}"
    )
    return system, user
