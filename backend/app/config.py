"""
ResumeLens — Configuration
==========================

Loads settings from the environment (.env in development). Secrets like the
Anthropic API key are read here ONCE and never hard-coded anywhere else.
"""

from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # --- Anthropic ---
    anthropic_api_key: str
    rewrite_model: str = "claude-sonnet-4-6"
    extract_model: str = "claude-haiku-4-5-20251001"

    # --- App ---
    app_env: str = "development"
    cors_origins: str = "http://localhost:3000"

    # --- Uploads ---
    max_upload_mb: int = 5
    allowed_extensions: str = ".docx"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    """Cached singleton so we read .env only once per process."""
    return Settings()  # type: ignore[call-arg]
