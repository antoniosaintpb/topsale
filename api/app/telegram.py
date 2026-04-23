import socket

from aiogram import Bot
from aiogram.client.session.aiohttp import AiohttpSession

from app.config import settings


def create_telegram_bot(token: str) -> Bot:
    session = AiohttpSession(proxy=settings.telegram_proxy_url or None)
    session._connector_init["family"] = socket.AF_INET
    return Bot(token=token, session=session)
