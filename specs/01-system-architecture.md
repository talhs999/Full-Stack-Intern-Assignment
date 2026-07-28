# System Architecture Specification
## AI-Powered Accounting & Finance Assistant

**Version:** 1.0  
**Branch:** feature/specs  
**Status:** Approved (based on Phase 1 Research)

---

## 1. Overview

The AI-Powered Accounting & Finance Assistant is a full-stack web application that enables businesses to manage their financial records through a natural language interface backed by deterministic database computations. It replaces manual spreadsheet-based accounting workflows with an intelligent, auditable, and visually rich system.

---

## 2. Three-Tier Architecture

```
+--------------------------------------------------------------+
|  TIER 1: PRESENTATION (Next.js 14 + TypeScript)              |
|  * App Router (Server + Client Components)                   |
|  * Dark Mode Design System (Glassmorphism, Animations)       |
|  * Pages: Dashboard, Expenses, Ledgers, Reports, Audit       |
|  * AI Chat Drawer (floating, accessible everywhere)          |
|  * REST API calls via fetch / axios                          |
+------------------+-------------------------------------------+
                   |  HTTPS REST (JSON)
                   |  Base URL: http://localhost:8000/api/v1
+------------------v-------------------------------------------+
|  TIER 2: LOGIC (FastAPI + Python, managed by uv)             |
|  +-------------------------------------------------------+   |
|  | AI Agent Layer (PydanticAI)                           |   |
|  |  Tools: create_transaction, list_transactions,        |   |
|  |         generate_pnl, generate_balance_sheet,         |   |
|  |         run_monthly_audit, summarize_spending         |   |
|  |  LLM: Gemini 2.0 Flash (primary, via GEMINI_API_KEY)  |   |
|  +-------------------------------------------------------+   |
|  +-------------------------------------------------------+   |
|  | REST Endpoints (FastAPI Routers)                      |   |
|  |  /api/v1/transactions  /api/v1/categories             |   |
|  |  /api/v1/accounts      /api/v1/reports                |   |
|  |  /api/v1/audit         /api/v1/agent/chat             |   |
|  +-------------------------------------------------------+   |
|  Pydantic v2 Schemas | SQLAlchemy 2 Async ORM | Alembic      |
+------------------+-------------------------------------------+
                   |  asyncpg (PostgreSQL wire protocol)
                   |  DATABASE_URL = supabase connection string
+------------------v-------------------------------------------+
|  TIER 3: DATA (Supabase — PostgreSQL as a Service)           |
|  Tables: accounts | categories | transactions | audit_logs   |
|  Row Level Security (RLS) enforced                           |
|  Real-time subscriptions available                           |
+--------------------------------------------------------------+
```

---

## 3. AI Agent Interaction Diagram

```
User types: "Add office rent of PKR 50,000 for July 2026"
         |
         v
  POST /api/v1/agent/chat
  { "message": "Add office rent of PKR 50,000 for July 2026" }
         |
         v
  PydanticAI Agent receives message
  -> sends to Gemini 2.0 Flash with system prompt + tool definitions
         |
         v
  Gemini returns tool_call: create_transaction(
      amount=50000,
      description="Office rent",
      category="Rent",
      account="Cash",
      date="2026-07-01",
      type="expense"
  )
         |
         v
  Tool executes: INSERT INTO transactions ... (asyncpg -> Supabase)
  Returns: Transaction record (Pydantic model)
         |
         v
  Gemini formats: "Done! I've recorded a rent expense of PKR 50,000
                   for July 2026 under the 'Rent' category."
         |
         v
  Response: { "reply": "...", "data": { transaction } }
         |
         v
  Frontend: Shows success toast + refreshes transactions table
```

---

## 4. Deployment Architecture (Phase 4)

```
Local Development:
  docker-compose up
  → postgres:5432 (Supabase replicated locally for dev)
  → backend:8000  (FastAPI via uvicorn)
  → frontend:3000 (Next.js dev server)

Production:
  Frontend  → Vercel (Next.js zero-config deploy)
  Backend   → Railway / Render (Docker container)
  Database  → Supabase Cloud (managed PostgreSQL)
```

---

## 5. Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Backend Framework | FastAPI | Async, high-performance, auto OpenAPI docs |
| Package Manager | uv | Assigned requirement; faster than pip |
| ORM | SQLAlchemy 2 async | Works seamlessly with asyncpg + Supabase |
| Agent Framework | PydanticAI | Type-safe, testable, provider-agnostic |
| Primary LLM | Gemini 2.0 Flash | Free tier, fast, long context, accurate tool calls |
| Database | Supabase (PostgreSQL) | Managed, scalable, real-time, free tier |
| Frontend Framework | Next.js 14 App Router | SSR + CSR, TypeScript, file-based routing |
| Containerization | Docker + Compose | 1-command local setup, portable |

---

## 6. Non-Functional Requirements

- **Zero-hallucination**: All monetary figures sourced exclusively from SQL queries
- **Auditability**: Every transaction change logged in `audit_logs` (append-only)
- **Type Safety**: Full TypeScript on frontend, Pydantic v2 on backend
- **Performance**: API responses < 500ms for CRUD; < 3s for AI agent interactions
- **Security**: Secrets in `.env` only; Supabase RLS enforced; input validation on all endpoints
