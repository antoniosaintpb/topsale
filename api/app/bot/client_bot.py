import asyncio
from uuid import UUID

import httpx
from aiogram import Dispatcher, F
from aiogram.filters import Command, CommandStart
from aiogram.types import ForceReply, Message

from app.config import settings
from app.services.intake import INTAKE_QUESTIONS
from app.telegram import create_telegram_bot

dp = Dispatcher()
bot = create_telegram_bot(settings.telegram_client_bot_token)
ACTIVE_LEADS_BY_CHAT: dict[int, str] = {}


FAQ_ANSWERS = {
    "что это": "Это первичная AI-диагностика отдела продаж: короткий сбор фактов и структурированный отчет с планом.",
    "сколько времени": "Сбор контекста обычно 5-10 минут. Отчет формируется сразу после ответов.",
    "это замена консультанта": "Нет. Это быстрый аудит и гипотезы. Финальные решения принимает человек-специалист.",
    "какие данные нужны": "Метрики воронки, CRM, размер команды, средний чек, цикл сделки — чем точнее ответы, тем полезнее отчет.",
    "насколько точно": "Без полных данных модель дает гипотезы. Мы явно помечаем неопределенность.",
}


@dp.message(Command("faq"))
async def on_faq(message: Message):
    lines = ["FAQ (коротко):"]
    for question, answer in FAQ_ANSWERS.items():
        lines.append(f"- {question}: {answer}")
    lines.append("\nНапиши любой вопрос — постараюсь ответить в рамках продаж.")
    await message.answer("\n".join(lines))


def parse_lead_id_from_start(text: str) -> str | None:
    parts = text.split(maxsplit=1)
    if len(parts) < 2:
        return None
    try:
        UUID(parts[1])
        return parts[1]
    except ValueError:
        return None


@dp.message(CommandStart())
async def on_start(message: Message):
    lead_id = parse_lead_id_from_start(message.text or "")
    if not lead_id:
        await message.answer("Привет! Чтобы начать диагностику, открой бота по ссылке из сайта.")
        return

    await message.answer(
        "Спасибо! Начинаем короткую диагностику отдела продаж.\n\n"
        f"Вопрос 1/{len(INTAKE_QUESTIONS)}: {INTAKE_QUESTIONS[0]}",
        reply_markup=ForceReply(selective=True),
    )
    ACTIVE_LEADS_BY_CHAT[message.chat.id] = lead_id


@dp.message(F.text)
async def on_answer(message: Message):
    lead_id = ACTIVE_LEADS_BY_CHAT.get(message.chat.id)
    if not lead_id:
        await message.answer("Ответ засчитан. Для сохранения в систему отвечай на сообщение с вопросом от бота.")
        return

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(
            f"{settings.internal_api_base_url.rstrip('/')}/leads/{lead_id}/context",
            json={"source": "telegram", "payload": {"answer": message.text}},
        )
        if response.status_code >= 400:
            await message.answer("Не удалось сохранить ответ. Попробуй еще раз позже.")
            return
        data = response.json()

    next_question = data.get("next_question")
    if not next_question:
        await message.answer("Спасибо! Контекст собран. Запускаю диагностику...")
        ACTIVE_LEADS_BY_CHAT.pop(message.chat.id, None)
        async with httpx.AsyncClient(timeout=120) as client:
            diag_response = await client.post(
                f"{settings.internal_api_base_url.rstrip('/')}/leads/{lead_id}/diagnose"
            )
        if diag_response.status_code >= 400:
            await message.answer("Контекст собран, но не удалось сгенерировать отчет. Попробуй позже.")
            return
        diag = diag_response.json()
        summary = diag.get("report", {}).get("executive_summary", "Отчет готов.")
        await message.answer(f"Готово. Кратко:\n\n{summary}")
        return
    await message.answer(
        f"Следующий вопрос: {next_question}",
        reply_markup=ForceReply(selective=True),
    )


async def main():
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
