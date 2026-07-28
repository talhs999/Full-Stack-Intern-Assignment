# Frontend Features & UI/UX Specification
## AI-Powered Accounting & Finance Assistant

**Version:** 1.0 | **Framework:** Next.js 14 (App Router) + TypeScript | **Styling:** Custom CSS / Tailwind + Glassmorphism

---

## 1. Design System & Aesthetics (Stunning Premium Dark Mode)

We adhere to the project's **Rich Aesthetics** requirement: an interface that wows at first glance with vibrant colors, dark mode, glassmorphism cards, smooth micro-animations, and responsive layouts.

### Color Palette (Curated Dark Theme)
- **Background Root:** `#090D16` (Deep Obsidian Navy)
- **Card / Surface Background:** `rgba(18, 26, 43, 0.6)` (Glassmorphism backdrop-blur 16px)
- **Card Border:** `rgba(255, 255, 255, 0.08)` (Subtle luminous border)
- **Primary Accent (Revenue / Action):** `#00F2FE` to `#4FACFE` (Vibrant Cyan-Blue Gradient)
- **Secondary Accent (Expenses / Alerts):** `#FF0844` to `#FFB199` (Coral-Red Gradient)
- **Audit Anomaly Gold:** `#FFD200` to `#F7971E` (Amber-Gold Gradient)
- **Text Primary:** `#F8FAFC`
- **Text Secondary:** `#94A3B8`

### Typography & Micro-Animations
- **Font:** Google Font `Outfit` or `Inter` for modern sans-serif tech feel.
- **Micro-Animations:**
  - Hover glow effect on financial statistic cards (`box-shadow: 0 0 25px rgba(0, 242, 254, 0.2)`).
  - Smooth page transitions and drawer sliding animations (`transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`).
  - Live number counting animation when P&L metrics load.

---

## 2. Page & Screen Breakdown

### Screen 1: Dashboard (`/`)
- **Top Bar:** Organization branding ("Cyber Nuts Accounting AI"), current period selector, quick action buttons ("+ Expense", "+ Revenue"), and AI chat trigger.
- **Hero Stats Row:** 4 glowing glassmorphism cards:
  1. **Total Cash & Bank Balance** (with sparkline chart)
  2. **This Month's Revenue** (vs previous month %)
  3. **This Month's Expenses** (vs budget limit %)
  4. **Net Profit Margin** (color-coded cyan/coral)
- **Charts Section:**
  - **Revenue vs Expense Trend:** 6-month bar chart.
  - **Expense Breakdown by Category:** Interactive donut chart with vibrant category colors.
- **Recent Transactions Feed:** Real-time table showing latest entries with category badges and account names.

---

### Screen 2: Expenses & Revenue Logging (`/expenses`)
- **Quick Entry Tabs:** Switch between **Daily Petty Cash**, **Monthly Recurring Office Costs**, and **Revenue Receipts**.
- **Interactive Form:**
  - Amount input with automatic PKR currency formatting.
  - Category dropdown with visual color icons (Rent, Utilities, Salaries, Tea/Snacks, Software).
  - Account selector (Cash, HBL Bank, Meezan Bank).
  - Reference / invoice number tag.
- **Transaction Table:** Filterable table by category, date range, and account with inline edit/delete.

---

### Screen 3: General Ledger & Records (`/ledgers`)
- **Full Historical Ledger:** Paginated, sortable record of every financial event.
- **Advanced Filters:** Filter by debit/credit, date range, specific chart of account, or keyword search.
- **Export Action:** "Download PDF / CSV" button.

---

### Screen 4: Financial Reports & Audit View (`/reports`)
- **Tab 1: Profit & Loss (P&L):** Clean accounting statement view showing Revenue subtotal, Expense subtotal, and Net Income with drill-down capability into individual accounts.
- **Tab 2: Balance Sheet:** Structured Assets = Liabilities + Equity view.
- **Tab 3: AI Anomaly & Audit View (Core differentiator):**
  - Displays automated audit scan results for the month.
  - Highlights potential duplicates (same amount/category in short time).
  - Flags statistical outliers (e.g., electricity bill 300% higher than average).
  - Provides **"Approve as Valid"** or **"Flag for Investigation"** action buttons for human review.

---

### Screen 5: Persistent AI Chat Drawer (`<AIChatDrawer />`)
- **Placement:** Floating pill button at bottom-right ("Ask AI Assistant") that opens a sleek glassmorphism sidebar drawer from the right.
- **Capabilities in UI:**
  - **Conversational Entry:** User types *"Paid 25000 for high speed internet bill today from Bank"* -> Assistant replies with structured confirmation card and automatically refreshes the underlying page data!
  - **Financial Q&A:** User asks *"What is our biggest expense this month?"* -> Assistant presents an explanation along with an inline mini P&L table.
  - **Quick Prompts:** Pre-made suggestion pills (*"Summarize July spending"*, *"Run monthly audit"*, *"Show cash balance"*).
