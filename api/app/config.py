from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Sales Diagnostics API"
    database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/sales_diagnostics"
    web_base_url: str = "http://localhost:3000"
    internal_api_base_url: str = "http://localhost:8000/api"

    telegram_client_bot_token: str = ""
    telegram_owner_bot_token: str = ""
    owner_telegram_chat_id: int = 0
    telegram_proxy_url: str = ""

    yandex_folder_id: str = ""
    yandex_iam_token: str = ""
    yandex_api_key: str = ""
    yandex_model_uri: str = ""  # example: gpt://<folder_id>/yandexgpt-lite/latest
    yandex_completion_url: str = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion"
    yandex_llm_timeout_seconds: float = 30.0

    rate_limit_per_minute: int = 120  # set 0 to disable


settings = Settings()
