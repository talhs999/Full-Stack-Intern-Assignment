export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api/v1' : 'http://localhost:8000/api/v1');

export interface Account {
  id: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  description?: string;
  is_active: boolean;
  opening_balance: number;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color?: string;
  icon?: string;
  is_system: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  account_id: string;
  category_id: string;
  reference_no?: string;
  is_recurring: boolean;
  recurrence_type?: string;
  notes?: string;
  is_deleted: boolean;
  created_at: string;
  account?: Account;
  category?: Category;
}

export interface TransactionCreate {
  date: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  account_id: string;
  category_id: string;
  reference_no?: string;
  is_recurring?: boolean;
  notes?: string;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  color: string;
}

export interface PnLReport {
  period: string;
  total_income: number;
  total_expenses: number;
  net_profit: number;
  income_breakdown: CategoryBreakdown[];
  expense_breakdown: CategoryBreakdown[];
}

export interface BalanceSheetSection {
  total: number;
  items: { account: string; balance: number }[];
}

export interface BalanceSheetReport {
  as_of_date: string;
  assets: BalanceSheetSection;
  liabilities: BalanceSheetSection;
  equity: BalanceSheetSection;
  balanced: boolean;
}

export interface AnomalyItem {
  type: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  transaction_id: string;
  description: string;
  flagged_at: string;
}

export interface MonthlyAuditReport {
  period: string;
  anomalies: AnomalyItem[];
  total_anomalies: number;
  ai_summary: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  reply: string;
  tool_used?: string;
  structured_data?: any;
}

// API Fetch Helpers
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`API Error: ${res.statusText}`);
    }
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.message || 'Unknown API error');
    }
    return json.data;
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  getAccounts: () => fetchApi<Account[]>('/accounts'),
  updateAccount: (id: string, opening_balance: number) => 
    fetchApi<Account>(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify({ opening_balance }) }),
  getCategories: () => fetchApi<Category[]>('/categories'),
  getTransactions: (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<{ items: Transaction[]; total: number; total_pages: number }>(`/transactions${query}`);
  },
  createTransaction: (data: TransactionCreate) =>
    fetchApi<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  deleteTransaction: (id: string) => fetchApi<any>(`/transactions/${id}`, { method: 'DELETE' }),
  getPnL: (year: number, month?: number) => {
    const q = month ? `?year=${year}&month=${month}` : `?year=${year}`;
    return fetchApi<PnLReport>(`/reports/pnl${q}`);
  },
  getBalanceSheet: (dateStr?: string) => {
    const q = dateStr ? `?as_of_date=${dateStr}` : '';
    return fetchApi<BalanceSheetReport>(`/reports/balance-sheet${q}`);
  },
  getAuditAnomalies: (year: number, month: number) =>
    fetchApi<MonthlyAuditReport>(`/audit/anomalies?year=${year}&month=${month}`),
  chatWithAgent: (message: string, history?: ChatMessage[]) =>
    fetchApi<ChatResponse>('/agent/chat', { method: 'POST', body: JSON.stringify({ message, conversation_history: history }) }),
};
