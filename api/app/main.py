import time
from collections import defaultdict, deque

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.config import settings
from app.database import Base, engine
from app.routes.diagnosis import router as diagnosis_router
from app.routes.leads import router as leads_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name)


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_minute: int):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.events: dict[str, deque[float]] = defaultdict(deque)

    async def dispatch(self, request: Request, call_next):
        if self.requests_per_minute <= 0:
            return await call_next(request)

        if not request.url.path.startswith("/api/"):
            return await call_next(request)

        forwarded = request.headers.get("x-forwarded-for")
        client_host = forwarded.split(",")[0].strip() if forwarded else (request.client.host if request.client else "unknown")
        now = time.time()
        window_start = now - 60.0
        bucket = self.events[client_host]
        while bucket and bucket[0] < window_start:
            bucket.popleft()

        if len(bucket) >= self.requests_per_minute:
            return JSONResponse({"detail": "Rate limit exceeded"}, status_code=429)

        bucket.append(now)
        return await call_next(request)


app.add_middleware(RateLimitMiddleware, requests_per_minute=settings.rate_limit_per_minute)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(leads_router, prefix="/api")
app.include_router(diagnosis_router, prefix="/api")
