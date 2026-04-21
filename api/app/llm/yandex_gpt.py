from __future__ import annotations

import json
from typing import Any

import httpx

from app.config import settings


def _auth_headers() -> dict[str, str]:
    if settings.yandex_api_key:
        return {"Authorization": f"Api-Key {settings.yandex_api_key}"}
    if settings.yandex_iam_token:
        return {"Authorization": f"Bearer {settings.yandex_iam_token}"}
    return {}


def _model_uri() -> str | None:
    if settings.yandex_model_uri:
        return settings.yandex_model_uri
    if settings.yandex_folder_id:
        return f"gpt://{settings.yandex_folder_id}/yandexgpt-lite/latest"
    return None


def yandex_gpt_complete_json(messages: list[dict[str, str]], temperature: float = 0.2) -> dict[str, Any]:
    """
    Calls Yandex Foundation Models synchronous completion endpoint.

    Auth:
    - Prefer Api-Key if YANDEX_API_KEY is set
    - Else Bearer IAM token if YANDEX_IAM_TOKEN is set

    Notes:
    - This is intentionally minimal for MVP demos.
    """
    model_uri = _model_uri()
    headers = {
        "Content-Type": "application/json",
        **_auth_headers(),
    }
    if settings.yandex_folder_id:
        headers["x-folder-id"] = settings.yandex_folder_id

    if not model_uri or not headers.get("Authorization"):
        raise RuntimeError("YandexGPT is not configured (missing modelUri or auth).")

    payload = {
        "modelUri": model_uri,
        "completionOptions": {"stream": False, "temperature": temperature, "maxTokens": "2000"},
        "messages": messages,
    }

    timeout = httpx.Timeout(settings.yandex_llm_timeout_seconds)
    with httpx.Client(timeout=timeout) as client:
        response = client.post(settings.yandex_completion_url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()


def extract_text_from_completion(response_json: dict[str, Any]) -> str:
    try:
        alternatives = response_json["result"]["alternatives"]
        return alternatives[0]["message"]["text"]
    except Exception as exc:  # noqa: BLE001
        raise ValueError(f"Unexpected YandexGPT response shape: {json.dumps(response_json)[:500]}") from exc
