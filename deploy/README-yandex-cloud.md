# Минимальный деплой на Yandex Cloud (1 VM, дешево)

Цель: один сервер, на котором крутятся `web` + `api` + `bot` + `postgres`, а LLM идет в YandexGPT по API.

## 1) Создай VM
- Регион: `ru-central1`
- Размер: минимальный, но чтобы собрался Docker + Next build (ориентир 2 vCPU / 4-8 GB RAM)
- Образ: Ubuntu LTS

## 2) Установи Docker
На VM:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

## 3) Залей проект на сервер
Самый простой путь: `git clone` (если репозиторий есть) или `scp` архива.

## 4) Подключи домен (до запуска контейнеров)
1. Купи/используй существующий домен (например, `example.com`).
2. В DNS у регистратора добавь A-записи:
   - `@` -> `<PUBLIC_IP>`
   - `www` -> `<PUBLIC_IP>` (опционально)
3. Дождись обновления DNS (обычно 5-30 минут, иногда дольше).

## 5) Заполни `.env` в корне проекта
Минимум:
- `TELEGRAM_CLIENT_BOT_TOKEN`, `TELEGRAM_OWNER_BOT_TOKEN`, `OWNER_TELEGRAM_CHAT_ID`
- `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`
- YandexGPT:
  - `YANDEX_FOLDER_ID`
  - `YANDEX_API_KEY` **или** `YANDEX_IAM_TOKEN`
- домен:
  - `DOMAIN_NAME=example.com`
  - `WEB_BASE_URL=https://example.com`

Рекомендация по вебу:
- `NEXT_PUBLIC_API_BASE_URL=/api`
- `API_UPSTREAM_URL=http://api:8000` (внутри compose)

## 6) Подними стенд

```bash
cd deploy
docker compose up -d --build
```

Открой в браузере:
- `https://example.com`

После старта Caddy автоматически выпустит и продлит HTTPS-сертификат (Let's Encrypt).

## 7) Безопасность (важно)
- Не коммить `.env` в git.
- Если токены когда-либо светились в чате/скриншотах — перевыпусти токены в BotFather.
