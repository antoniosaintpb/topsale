import asyncio

import httpx
from aiogram import Bot, Dispatcher, F
from aiogram.filters import Command
from aiogram.types import CallbackQuery, Message

from app.config import settings
from app.models import LeadStatus

dp = Dispatcher()
bot = Bot(token=settings.telegram_owner_bot_token)


@dp.message(Command("start"))
async def on_start(message: Message):
    await message.answer("Бот специалиста активен. Здесь будут приходить новые диагностические заявки.")


@dp.callback_query(F.data.startswith("status:"))
async def on_status_callback(callback: CallbackQuery):
    # format: status:<status>:<lead_uuid>
    parts = (callback.data or "").split(":")
    if len(parts) != 3:
        await callback.answer("Некорректные данные", show_alert=True)
        return

    _, status_value, lead_id = parts
    try:
        new_status = LeadStatus(status_value)
    except ValueError:
        await callback.answer("Неизвестный статус", show_alert=True)
        return

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.patch(
            f"{settings.internal_api_base_url.rstrip('/')}/leads/{lead_id}/status",
            json={"status": new_status.value},
        )

    if response.status_code >= 400:
        await callback.answer("Не удалось обновить статус", show_alert=True)
        return

    await callback.message.edit_reply_markup(reply_markup=None)
    await callback.answer("Статус обновлен", show_alert=False)
    await callback.message.answer(f"Статус лида {lead_id} -> {new_status.value}")


async def main():
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
