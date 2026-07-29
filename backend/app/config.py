import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "Cyber Nuts AI Accounting Assistant"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    # We force SQLite on Vercel because the user has a broken Supabase URL in their Vercel settings
    # which causes 500 errors.
    DATABASE_URL: str = "sqlite+aiosqlite:////tmp/accounting.db" if os.getenv("VERCEL") else os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./accounting.db")
    AI_PROVIDER: str = "gemini"
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None

    @property
    def gemini_keys_list(self) -> list[str]:
        keys = []
        if self.GEMINI_API_KEY:
            keys.extend([k.strip() for k in self.GEMINI_API_KEY.split(",") if k.strip()])
        if not keys:
            keys.append("dummy_key")
        return keys

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
