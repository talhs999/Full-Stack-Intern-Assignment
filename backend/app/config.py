import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "Cyber Nuts AI Accounting Assistant"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    # On Vercel, the file system is read-only except for /tmp.
    # We dynamically check if it's running on Vercel and use /tmp.
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:////tmp/accounting.db" if os.getenv("VERCEL") else "sqlite+aiosqlite:///./accounting.db")
    
    AI_PROVIDER: str = "gemini"
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
