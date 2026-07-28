# 🚀 AI-Powered Accounting & Finance Assistant

**Developed for:** Cyber Nuts  
**Author:** Muhammad Talha Khan  
**Project Type:** Full-Stack AI Engineering & Accounting Automation (Internship Assignment)

---

## 🌟 Executive Summary

The **AI-Powered Accounting & Finance Assistant** is a next-generation enterprise financial automation system built to bridge the gap between complex double-entry bookkeeping and intuitive natural language interaction. Engineered with **PydanticAI**, **Google Gemini 2.0 Flash**, **FastAPI**, **Supabase PostgreSQL**, and **Next.js 14**, this platform eliminates financial hallucination while automating invoice entry, expense classification, real-time ledger auditing, and financial statement generation.

---

## 🏗️ Architecture & Tech Stack

```
+---------------------------------------------------------------------------------+
|                                CLIENT TIER (PORT 3000)                          |
|   Next.js 14 (App Router) * TypeScript * Tailwind CSS * Glassmorphism UI        |
|   +--------------------+   +--------------------+   +----------------------+    |
|   |  Dashboard & Stats |   |  Expense / Revenue |   |  Persistent AI Drawer|    |
|   +---------+----------+   +---------+----------+   +----------+-----------+    |
+-------------+------------------------+-------------------------+----------------+
              |                        |                         | REST / JSON
+-------------v------------------------v-------------------------v----------------+
|                              APPLICATION TIER (PORT 8000)                       |
|       FastAPI (Async Python 3.11+) * Astral 'uv' Package Environment            |
|   +--------------------+   +--------------------+   +----------------------+    |
|   |  Pydantic v2 Models|   | SQLAlchemy Async   |   |  PydanticAI Engine   |    |
|   |  Schema Validation |   |  CRUD & Seeding    |   |  Zero-Hallucination  |    |
|   +---------+----------+   +---------+----------+   +----------+-----------+    |
+-------------+------------------------+-------------------------+----------------+
              |                        |                         | Asyncpg / SQL
+-------------v------------------------v-------------------------v----------------+
|                                 DATA TIER (PERSISTENT)                          |
|        Supabase PostgreSQL (Row Level Security & Append-Only Audit Logs)        |
|   +------------------------------------------------------------------------+    |
|   | tables: accounts | categories | transactions | audit_logs              |    |
|   +------------------------------------------------------------------------+    |
+---------------------------------------------------------------------------------+
```

### Key Technologies
- **Backend Environment:** Python 3.11 managed via **Astral `uv`** (fastest package manager).
- **API Framework:** **FastAPI** with asynchronous SQLAlchemy ORM (`asyncpg` / `aiosqlite`).
- **AI Engine:** **PydanticAI** + Google Gemini 2.0 Flash with deterministic tool calls and regex NLP fallback for 100% demo reliability.
- **Frontend UI:** **Next.js 14** + TypeScript with custom dark-mode glassmorphism styling, micro-animations, and Outfit typography.
- **Database:** **Supabase PostgreSQL** optimized with RLS policies, indexing, and immutable audit logs.

---

## ✨ Core Features & Differentiators

1. **Zero-Hallucination Financial Calculations:**
   - The AI agent is restricted from computing totals or averages in its LLM context. It dynamically invokes deterministic SQL aggregation tools (`generate_pnl`, `generate_balance_sheet`).
2. **Persistent AI Chat Drawer ⭐:**
   - Accessible from any page via a floating trigger. Users can input plain natural language (English or Urdu) such as *"Paid 25,000 for office rent today"* -> The agent resolves accounts, logs the transaction, and returns a structured confirmation badge.
3. **Automated Continuous Audit Scan ⭐:**
   - Evaluates monthly transactions against statistical anomaly heuristics:
     - **High-Risk Duplicate Detection:** Same amount and category within a 3-day window.
     - **Outlier Alert:** Single expense exceeding standard operational thresholds.
   - Interactive UI allowing accountants to **"Approve as Valid"** or **"Flag for Investigation"**.
4. **Rich Glassmorphism Aesthetics:**
   - Curated HSL dark mode with vibrant neon cyan (`#00F2FE`), coral (`#FF0844`), and amber accents, glowing card hover states, and smooth progress indicators.
5. **Double-Entry Ledger Integrity:**
   - Fully auditable historical ledger with client-side CSV export and complete CRUD lifecycle tracking in `audit_logs`.

---

## ⚡ Quickstart & Run Guide

### Option A: Local Zero-Setup Run (Recommended for Development)

#### 1. Start FastAPI Backend (with `uv`)
```bash
cd backend
# Install dependencies & create venv automatically
uv sync

# Run server on http://localhost:8000
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
*Note: Default configuration uses an embedded SQLite database (`accounting.db`) initialized with default chart of accounts and categories automatically on startup! To use Supabase, simply paste your PostgreSQL connection string in `backend/.env`.*

#### 2. Start Next.js Frontend
```bash
cd frontend
# Install Node modules
npm install

# Run dev server on http://localhost:3000
npm run dev
```
Visit **http://localhost:3000** in your browser to experience the dashboard!

---

### Option B: Docker Compose Deployment

To launch the entire full-stack containerized suite:
```bash
# Build and run containers in detached mode
docker-compose up --build -d

# Check logs
docker-compose logs -f
```
- Frontend UI: `http://localhost:3000`
- Backend API Docs (Swagger): `http://localhost:8000/docs`
- Backend ReDoc: `http://localhost:8000/redoc`

---

## 🧪 Testing & Verification

The project includes an automated test suite verifying schema validation, API health, and AI chat fallback rules.
```bash
cd backend
uv run pytest -v
```

---

## 📁 Repository Structure

```
|-- research/                  # Phase 1: Research Paper & ReportLab PDF Generator
|   |-- 01_Research_Paper.md
|   +-- generate_pdf.py
|-- specs/                     # Phase 2: System Specifications (SDD)
|   |-- 01-system-architecture.md
|   |-- 02-database-schema.md
|   |-- 03-api-contracts.md
|   |-- 04-ai-agent-behavior.md
|   +-- 05-frontend-features.md
|-- backend/                   # Phase 3: FastAPI Backend (managed with uv)
|   |-- app/
|   |   |-- models/            # SQLAlchemy ORM models
|   |   |-- schemas/           # Pydantic v2 validation schemas
|   |   |-- services/          # Ledger calculations & AI agent tool engine
|   |   +-- routers/           # REST API routes (/transactions, /reports, /audit, /agent)
|   |-- tests/                 # Pytest test suite
|   |-- pyproject.toml         # uv project configuration
|   +-- Dockerfile
|-- frontend/                  # Phase 3: Next.js 14 Glassmorphism Frontend
|   |-- src/
|   |   |-- app/               # Dashboard, Expenses, Ledgers, Reports & Audit screens
|   |   |-- components/        # Navbar, StatCard, and persistent AIChatDrawer
|   |   +-- lib/               # TypeScript API client helper
|   |-- tailwind.config / css  # Custom dark theme tokens
|   +-- Dockerfile
|-- docker-compose.yml         # Phase 4: Container orchestration
+-- Final_Research_Paper_AI_Accounting_Assistant.pdf  # Formatted Research Paper
```

---

## 🏆 Assignment Compliance Summary

| Requirement | Implementation Status | Proof / Location |
| :--- | :--- | :--- |
| **Author Name** | Muhammad Talha Khan | Research Paper, Navbar, README |
| **Organization** | Cyber Nuts | PDF cover, metadata, system prompts |
| **Branching & Commit Rules** | Strict Git flow (`feature/specs`, `feature/backend-setup`, `feature/ui-dashboard`, `feature/docker-deploy`) | Git log history |
| **Python Package Manager** | **Astral `uv`** mandated and configured | `backend/pyproject.toml`, `backend/uv.lock` |
| **Database Engine** | **Supabase PostgreSQL** (with local dev fallback) | `specs/02-database-schema.md`, `backend/app/models` |
| **AI Framework** | **PydanticAI** + Gemini 2.0 Flash + Zero Hallucination | `backend/app/services/agent.py` |
| **Frontend Framework** | **Next.js 14** + TypeScript + Rich Glassmorphism | `frontend/src/` |
| **Continuous Audit View ⭐** | Automated anomaly detection heuristics | `frontend/src/app/reports/page.tsx` |
| **Containerization** | Multi-stage Docker builds & Compose | `docker-compose.yml`, Dockerfiles |
