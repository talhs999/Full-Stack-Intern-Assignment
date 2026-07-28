# API Contracts Specification
## AI-Powered Accounting & Finance Assistant

**Version:** 1.0 | **Base URL:** `http://localhost:8000/api/v1`  
**Format:** JSON | **Auth:** Bearer token (Supabase JWT) via `Authorization` header

---

## 1. Global Response Envelope

All responses follow this structure:

```json
// Success
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

// Error
{
  "success": false,
  "error": "Validation error",
  "detail": "amount must be greater than 0"
}
```

---

## 2. Transactions Endpoints

### `POST /transactions` — Create Transaction

**Request Body:**
```json
{
  "date": "2026-07-01",
  "amount": 50000.00,
  "type": "expense",
  "description": "Monthly office rent",
  "account_id": "uuid",
  "category_id": "uuid",
  "reference_no": "INV-001",
  "is_recurring": true,
  "recurrence_type": "monthly",
  "notes": "Due on 1st of every month"
}
```

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "date": "2026-07-01",
    "amount": 50000.00,
    "type": "expense",
    "description": "Monthly office rent",
    "account": { "id": "uuid", "name": "Bank Account" },
    "category": { "id": "uuid", "name": "Rent", "color": "#E53935" },
    "reference_no": "INV-001",
    "is_recurring": true,
    "recurrence_type": "monthly",
    "created_at": "2026-07-28T12:00:00Z"
  }
}
```

**Validation Rules (Pydantic):**
- `date`: valid date, not in future beyond 7 days
- `amount`: `Decimal > 0`, max 13 digits before decimal, 2 after
- `type`: must be `"income"` or `"expense"`
- `description`: min 3 chars, max 500 chars
- `account_id`, `category_id`: valid UUIDs that exist in DB

---

### `GET /transactions` — List Transactions

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | int | Page number (default: 1) |
| `page_size` | int | Items per page (default: 20, max: 100) |
| `type` | str | Filter: `income` or `expense` |
| `category_id` | UUID | Filter by category |
| `account_id` | UUID | Filter by account |
| `date_from` | date | Start date filter |
| `date_to` | date | End date filter |
| `search` | str | Full-text search on description |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "items": [ { ...transaction } ],
    "total": 145,
    "page": 1,
    "page_size": 20,
    "total_pages": 8
  }
}
```

---

### `GET /transactions/{id}` — Get Single Transaction

**Response `200`:** Full transaction object (same as create response data)

---

### `PUT /transactions/{id}` — Update Transaction

**Request Body:** Same fields as POST (all optional, only provided fields updated)  
**Response `200`:** Updated transaction object  
**Side Effect:** Audit log entry created automatically

---

### `DELETE /transactions/{id}` — Soft Delete

**Response `200`:**
```json
{ "success": true, "message": "Transaction deleted successfully" }
```
**Note:** Sets `is_deleted = TRUE`. Record remains in DB for audit purposes.

---

## 3. Accounts Endpoints

### `GET /accounts` — List All Accounts
### `POST /accounts` — Create Account
### `PUT /accounts/{id}` — Update Account

**Account Schema:**
```json
{
  "name": "Petty Cash",
  "type": "asset",
  "description": "Small cash fund for minor expenses"
}
```

---

## 4. Categories Endpoints

### `GET /categories` — List All Categories
### `POST /categories` — Create Category
### `PUT /categories/{id}` — Update Category

**Category Schema:**
```json
{
  "name": "Entertainment",
  "type": "expense",
  "color": "#7B1FA2",
  "icon": "party"
}
```

---

## 5. Reports Endpoints

### `GET /reports/pnl` — Profit & Loss Statement

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `year` | int | Required year (e.g. 2026) |
| `month` | int | Optional month (1-12). If omitted, returns full year |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "period": "July 2026",
    "total_income": 500000.00,
    "total_expenses": 320000.00,
    "net_profit": 180000.00,
    "income_breakdown": [
      { "category": "Sales", "amount": 450000.00 },
      { "category": "Service Fees", "amount": 50000.00 }
    ],
    "expense_breakdown": [
      { "category": "Salaries", "amount": 150000.00 },
      { "category": "Rent", "amount": 50000.00 },
      { "category": "Utilities", "amount": 20000.00 }
    ]
  }
}
```

---

### `GET /reports/balance-sheet` — Balance Sheet

**Query Parameters:** `as_of_date` (date, default: today)

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "as_of_date": "2026-07-28",
    "assets": {
      "total": 1200000.00,
      "items": [
        { "account": "Cash", "balance": 300000.00 },
        { "account": "Bank Account", "balance": 700000.00 },
        { "account": "Accounts Receivable", "balance": 200000.00 }
      ]
    },
    "liabilities": {
      "total": 400000.00,
      "items": [
        { "account": "Accounts Payable", "balance": 150000.00 },
        { "account": "Loan Payable", "balance": 250000.00 }
      ]
    },
    "equity": {
      "total": 800000.00,
      "items": [
        { "account": "Owner's Equity", "balance": 620000.00 },
        { "account": "Retained Earnings", "balance": 180000.00 }
      ]
    },
    "balanced": true
  }
}
```

---

### `GET /reports/spending-summary` — Category Spending Summary

**Query Parameters:** `date_from`, `date_to`  
**Response:** Array of `{ category, total_amount, transaction_count, color }`

---

## 6. Audit Endpoints

### `GET /audit/logs` — View Audit Trail

**Query Parameters:** `transaction_id` (optional UUID), `date_from`, `date_to`, `page`, `page_size`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "transaction_id": "uuid",
        "action": "UPDATE",
        "changed_fields": {
          "amount": { "old": 45000.00, "new": 50000.00 }
        },
        "performed_by": "AI_AGENT",
        "performed_at": "2026-07-28T10:30:00Z"
      }
    ],
    "total": 38
  }
}
```

---

### `GET /audit/anomalies` — Monthly Anomaly Report

**Query Parameters:** `year` (int), `month` (int)

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "period": "July 2026",
    "anomalies": [
      {
        "type": "DUPLICATE",
        "severity": "HIGH",
        "transaction_id": "uuid",
        "description": "Possible duplicate: same amount (50,000) and category (Rent) within 3 days",
        "flagged_at": "2026-07-28T10:30:00Z"
      },
      {
        "type": "OUTLIER",
        "severity": "MEDIUM",
        "transaction_id": "uuid",
        "description": "Utilities expense 340% above monthly average",
        "flagged_at": "2026-07-28T10:30:00Z"
      }
    ],
    "total_anomalies": 2,
    "ai_summary": "Found 2 anomalies this month: 1 possible duplicate rent entry and 1 unusually high utilities bill."
  }
}
```

---

## 7. AI Agent Chat Endpoint

### `POST /agent/chat` — Natural Language Query

**Request Body:**
```json
{
  "message": "What is my total spending for July 2026?",
  "conversation_history": [
    { "role": "user", "content": "Add July rent of 50,000" },
    { "role": "assistant", "content": "Done! I've recorded..." }
  ]
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "reply": "Your total spending for July 2026 is PKR 320,000. The biggest expense category was Salaries at PKR 150,000 (47%), followed by Rent at PKR 50,000 (16%).",
    "tool_used": "generate_pnl",
    "structured_data": {
      "total_expenses": 320000.00,
      "breakdown": [ ... ]
    }
  }
}
```

---

## 8. Health Check

### `GET /health`
```json
{ "status": "ok", "version": "1.0.0", "database": "connected" }
```
