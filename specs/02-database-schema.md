# Database Schema Specification
## AI-Powered Accounting & Finance Assistant

**Version:** 1.0 | **Database:** Supabase (PostgreSQL 15+)

---

## 1. Schema Design Principles

- All monetary values stored as `DECIMAL(15,2)` — no floating-point errors
- All timestamps in UTC (`TIMESTAMPTZ`)
- Soft deletes via `is_deleted` flag — records never physically removed
- Append-only `audit_logs` table — no UPDATE or DELETE allowed
- Foreign keys enforced at DB level
- Row Level Security (RLS) enabled on all tables

---

## 2. Table: `accounts`

Represents the Chart of Accounts — the complete list of financial accounts.

```sql
CREATE TABLE accounts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    type        VARCHAR(20)  NOT NULL CHECK (type IN (
                    'asset', 'liability', 'equity', 'revenue', 'expense'
                )),
    description TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Seed Data (initial Chart of Accounts):**

| name | type |
|------|------|
| Cash | asset |
| Bank Account | asset |
| Accounts Receivable | asset |
| Office Equipment | asset |
| Accounts Payable | liability |
| Loan Payable | liability |
| Owner's Equity | equity |
| Sales Revenue | revenue |
| Service Revenue | revenue |
| Rent Expense | expense |
| Utilities Expense | expense |
| Salaries Expense | expense |
| Office Supplies Expense | expense |
| Marketing Expense | expense |
| Miscellaneous Expense | expense |

---

## 3. Table: `categories`

User-defined and system-default categories for organizing transactions.

```sql
CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    type        VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    color       VARCHAR(7),   -- hex color e.g. '#1E88E5' for UI display
    icon        VARCHAR(50),  -- icon name for frontend
    is_system   BOOLEAN NOT NULL DEFAULT FALSE,  -- system defaults can't be deleted
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Seed Data:**

| name | type | color |
|------|------|-------|
| Rent | expense | #E53935 |
| Utilities | expense | #FB8C00 |
| Salaries | expense | #8E24AA |
| Office Supplies | expense | #039BE5 |
| Marketing | expense | #00897B |
| Travel | expense | #43A047 |
| Petty Cash | expense | #6D4C41 |
| Miscellaneous | expense | #757575 |
| Sales | income | #1E88E5 |
| Service Fees | income | #00ACC1 |
| Interest Income | income | #7CB342 |

---

## 4. Table: `transactions`

The core ledger — every single financial entry in the system.

```sql
CREATE TABLE transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date            DATE NOT NULL,
    amount          DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    type            VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    description     TEXT NOT NULL,
    account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    category_id     UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    reference_no    VARCHAR(100),   -- invoice/voucher number
    is_recurring    BOOLEAN NOT NULL DEFAULT FALSE,
    recurrence_type VARCHAR(20) CHECK (recurrence_type IN ('daily','weekly','monthly','yearly')),
    notes           TEXT,
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX idx_transactions_date       ON transactions(date DESC);
CREATE INDEX idx_transactions_type       ON transactions(type);
CREATE INDEX idx_transactions_category   ON transactions(category_id);
CREATE INDEX idx_transactions_account    ON transactions(account_id);
CREATE INDEX idx_transactions_not_deleted ON transactions(is_deleted) WHERE is_deleted = FALSE;
```

---

## 5. Table: `audit_logs`

Immutable audit trail of every change to `transactions`. INSERT ONLY — no updates or deletes.

```sql
CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id  UUID NOT NULL REFERENCES transactions(id) ON DELETE RESTRICT,
    action          VARCHAR(10) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
    changed_fields  JSONB,        -- { "amount": { "old": 1000, "new": 2000 } }
    performed_by    VARCHAR(100), -- username or 'AI_AGENT'
    performed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address      INET
);

-- No UPDATE or DELETE allowed on this table (enforced via Supabase RLS policy)
CREATE INDEX idx_audit_transaction ON audit_logs(transaction_id);
CREATE INDEX idx_audit_performed_at ON audit_logs(performed_at DESC);
```

---

## 6. Computed Views (for Reports)

```sql
-- Monthly P&L Summary View
CREATE VIEW v_monthly_pnl AS
SELECT
    DATE_TRUNC('month', date)::DATE                          AS month,
    SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END)  AS total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)  AS total_expenses,
    SUM(CASE WHEN type = 'income'  THEN amount ELSE -amount END) AS net_profit
FROM transactions
WHERE is_deleted = FALSE
GROUP BY DATE_TRUNC('month', date)
ORDER BY month DESC;

-- Category-wise Spending View
CREATE VIEW v_category_spending AS
SELECT
    c.name           AS category,
    c.type           AS category_type,
    c.color,
    COUNT(t.id)      AS transaction_count,
    SUM(t.amount)    AS total_amount,
    MAX(t.date)      AS last_transaction_date
FROM categories c
LEFT JOIN transactions t ON t.category_id = c.id AND t.is_deleted = FALSE
GROUP BY c.id, c.name, c.type, c.color
ORDER BY total_amount DESC NULLS LAST;
```

---

## 7. Supabase Setup SQL (Run in Supabase SQL Editor)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Run all CREATE TABLE statements above in order:
-- 1. accounts
-- 2. categories
-- 3. transactions
-- 4. audit_logs

-- Enable Row Level Security
ALTER TABLE accounts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs   ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (expand per auth requirements)
CREATE POLICY "Allow all for authenticated" ON accounts     FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON categories   FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON transactions FOR ALL USING (true);
CREATE POLICY "Allow read only audit_logs"  ON audit_logs   FOR SELECT USING (true);
CREATE POLICY "Allow insert audit_logs"     ON audit_logs   FOR INSERT WITH CHECK (true);
-- No UPDATE or DELETE policy on audit_logs = immutable
```

---

## 8. Environment Variable Required

```
DATABASE_URL=postgresql+asyncpg://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

> Get this from: Supabase Dashboard → Project → Settings → Database → Connection String → URI (Session Mode port 5432, or Pooler port 6543 for serverless)
