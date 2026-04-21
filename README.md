# AI Sales Diagnostics MVP

Day 1 implementation includes:
- FastAPI backend with lead intake endpoints.
- PostgreSQL models for lead, context, reports, and specialist notifications.
- Next.js frontend with landing form and lead status page.
- Telegram client bot skeleton for context collection.

## Quick start

1. Copy `.env.example` to `.env`.
2. Start Postgres:
   - `docker compose up -d`
3. Backend:
   - `cd api`
   - `python -m venv .venv`
   - `.venv\\Scripts\\activate`
   - `pip install -r requirements.txt`
   - `uvicorn app.main:app --reload --port 8000`
4. Frontend:
   - `cd web`
   - `npm install`
   - `npm run dev`
5. Telegram bot (separate terminal):
   - `cd api`
   - `python -m app.bot.client_bot`

## Yandex Cloud (single VM)
See [deploy/README-yandex-cloud.md](deploy/README-yandex-cloud.md).

## Core API
- `POST /api/leads`
- `GET /api/leads/{lead_id}`
- `POST /api/leads/{lead_id}/start-diagnosis`
- `POST /api/leads/{lead_id}/context`
- `POST /api/leads/{lead_id}/diagnose`
- `GET /api/leads/{lead_id}/report`
