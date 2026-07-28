# AI-Powered Accounting Assistant — Backend (FastAPI + uv + Supabase)

## Requirements
- Python 3.11+
- `uv` package manager (`pip install uv`)
- Supabase (PostgreSQL) or local SQLite

## Setup & Run (with uv)
```bash
# 1. Copy environment file
cp .env.example .env

# 2. Sync dependencies and create venv with uv
uv sync

# 3. Run FastAPI dev server with auto-reload
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation
Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
