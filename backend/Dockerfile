# Multi-stage build for FastAPI backend managed with uv
FROM python:3.11-slim AS builder

WORKDIR /app

# Install curl and uv
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && \
    curl -LsSf https://astral.sh/uv/install.sh | sh && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

ENV PATH="/root/.local/bin:$PATH"

# Copy dependency definition files
COPY pyproject.toml uv.lock ./

# Install dependencies into a standalone venv
RUN uv sync --frozen --no-dev

# Copy application source code
COPY . .

# Final stage
FROM python:3.11-slim

WORKDIR /app

COPY --from=builder /app /app
COPY --from=builder /root/.local /root/.local

ENV PATH="/root/.local/bin:/app/.venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
