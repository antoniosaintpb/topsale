import socket

from aiogram import Bot
from aiogram.client.session.aiohttp import AiohttpSession


def create_telegram_bot(token: str) -> Bot:
    session = AiohttpSession()
    session._connector_init["family"] = socket.AF_INET
    return Bot(token=token, session=session)
