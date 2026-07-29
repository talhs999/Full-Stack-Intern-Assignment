from datetime import datetime, date
from decimal import Decimal
from typing import Optional, Literal, Any, List, Dict
from pydantic import BaseModel, Field, ConfigDict, computed_field

# --- Envelopes ---
class ApiResponse(BaseModel):
    success: bool = True
    data: Any = None
    message: str = "Operation successful"

# --- Account Schemas ---
class AccountBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    type: Literal['asset', 'liability', 'equity', 'revenue', 'expense']
    description: Optional[str] = None
    is_active: bool = True
    opening_balance: Decimal = Decimal('0.0')

class AccountCreate(AccountBase):
    pass

class AccountUpdate(BaseModel):
    opening_balance: Decimal

class AccountResponse(AccountBase):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Category Schemas ---
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    type: Literal['income', 'expense']
    color: Optional[str] = "#1E88E5"
    icon: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: str
    is_system: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Transaction Schemas ---
class TransactionBase(BaseModel):
    date: date
    amount: Decimal = Field(..., gt=0)
    type: Literal['income', 'expense']
    description: str = Field(..., min_length=2, max_length=500)
    account_id: str
    category_id: str
    reference_no: Optional[str] = None
    is_recurring: bool = False
    recurrence_type: Optional[Literal['daily', 'weekly', 'monthly', 'yearly']] = None
    notes: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    date: Optional[date] = None
    amount: Optional[Decimal] = Field(None, gt=0)
    type: Optional[Literal['income', 'expense']] = None
    description: Optional[str] = Field(None, min_length=2, max_length=500)
    account_id: Optional[str] = None
    category_id: Optional[str] = None
    reference_no: Optional[str] = None
    is_recurring: Optional[bool] = None
    recurrence_type: Optional[Literal['daily', 'weekly', 'monthly', 'yearly']] = None
    notes: Optional[str] = None

class TransactionResponse(TransactionBase):
    id: str
    is_deleted: bool
    created_at: datetime
    updated_at: datetime
    account: Optional[AccountResponse] = None
    category: Optional[CategoryResponse] = None
    model_config = ConfigDict(from_attributes=True)

class TransactionListResponse(BaseModel):
    items: List[TransactionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# --- Audit Log Schemas ---
class AuditLogResponse(BaseModel):
    id: str
    transaction_id: str
    action: str
    changed_fields: Optional[Dict[str, Any]] = None
    performed_by: Optional[str] = None
    performed_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Financial Reports Schemas ---
class CategoryBreakdownItem(BaseModel):
    category: str
    amount: Decimal
    color: Optional[str] = "#1E88E5"

class PnLResponse(BaseModel):
    period: str
    total_income: Decimal
    total_expenses: Decimal
    net_profit: Decimal
    income_breakdown: List[CategoryBreakdownItem]
    expense_breakdown: List[CategoryBreakdownItem]

    @computed_field
    @property
    def profit_margin_percentage(self) -> str:
        if self.total_income > 0:
            return f"{((self.net_profit / self.total_income) * 100):.1f}%"
        return "0.0%"

class BalanceSheetItem(BaseModel):
    account: str
    balance: Decimal
    warning: Optional[str] = None

class BalanceSheetSection(BaseModel):
    total: Decimal
    items: List[BalanceSheetItem]

class BalanceSheetResponse(BaseModel):
    as_of_date: str
    assets: BalanceSheetSection
    liabilities: BalanceSheetSection
    equity: BalanceSheetSection
    balanced: bool

class AnomalyItem(BaseModel):
    type: str  # DUPLICATE, OUTLIER, OFF_HOURS
    severity: str  # HIGH, MEDIUM, LOW
    transaction_id: str
    description: str
    flagged_at: str

class MonthlyAuditResponse(BaseModel):
    period: str
    anomalies: List[AnomalyItem]
    total_anomalies: int
    total_transactions: int
    status: str  # "clean" or "anomalies_found"
    ai_summary: str

# --- AI Chat Schemas ---
class ChatMessage(BaseModel):
    role: Literal['user', 'assistant']
    content: str

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = None

class ChatResponse(BaseModel):
    reply: str
    tool_used: Optional[str] = None
    structured_data: Optional[Any] = None
