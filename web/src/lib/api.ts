const publicApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
const serverApiUpstream = process.env.API_UPSTREAM_URL ?? "http://localhost:8000";
const serverApiBaseUrl = serverApiUpstream.endsWith("/api") ? serverApiUpstream : `${serverApiUpstream}/api`;

export const API_BASE_URL = typeof window === "undefined" ? serverApiBaseUrl : publicApiBaseUrl;
export const TELEGRAM_BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "your_client_bot";
