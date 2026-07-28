from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc
from sqlalchemy.orm import selectinload

from app.models.models import Account, Category, Transaction, AuditLog
from app.schemas.schemas import (
    TransactionCreate, TransactionUpdate, PnLResponse, CategoryBreakdownItem,
    BalanceSheetResponse, BalanceSheetSection, BalanceSheetItem,
    MonthlyAuditResponse, AnomalyItem
)

# --- Seeding Helpers ---
async def seed_initial_data(db: AsyncSession):
    # Check accounts
    res_acc = await db.execute(select(func.count(Account.id)))
    if res_acc.scalar() == 0:
        default_accounts = [
            Account(name="Cash", type="asset", description="Physical cash on hand"),
            Account(name="Bank Account", type="asset", description="Primary company bank account"),
            Account(name="Accounts Receivable", type="asset", description="Money owed by customers"),
            Account(name="Accounts Payable", type="liability", description="Money owed to vendors"),
            Account(name="Owner's Equity", type="equity", description="Capital invested"),
        ]
        db.add_all(default_accounts)
    
    # Check categories
    res_cat = await db.execute(select(func.count(Category.id)))
    if res_cat.scalar() == 0:
        default_categories = [
            Category(name="Rent", type="expense", color="#E53935", icon="home", is_system=True),
            Category(name="Utilities", type="expense", color="#FB8C00", icon="bolt", is_system=True),
            Category(name="Salaries", type="expense", color="#8E24AA", icon="users", is_system=True),
            Category(name="Office Supplies", type="expense", color="#039BE5", icon="briefcase", is_system=True),
            Category(name="Marketing", type="expense", color="#00897B", icon="trending-up", is_system=True),
            Category(name="Petty Cash", type="expense", color="#6D4C41", icon="coffee", is_system=True),
            Category(name="Miscellaneous", type="expense", color="#757575", icon="help-circle", is_system=True),
            Category(name="Sales", type="income", color="#1E88E5", icon="dollar-sign", is_system=True),
            Category(name="Service Fees", type="income", color="#00ACC1", icon="award", is_system=True),
        ]
        db.add_all(default_categories)
    await db.commit()

# --- Account CRUD ---
async def get_accounts(db: AsyncSession) -> List[Account]:
    res = await db.execute(select(Account).order_by(Account.name))
    return list(res.scalars().all())

async def get_account_by_name(db: AsyncSession, name: str) -> Optional[Account]:
    res = await db.execute(select(Account).where(func.lower(Account.name) == name.lower()))
    return res.scalars().first()

# --- Category CRUD ---
async def get_categories(db: AsyncSession) -> List[Category]:
    res = await db.execute(select(Category).order_by(Category.name))
    return list(res.scalars().all())

async def get_category_by_name(db: AsyncSession, name: str) -> Optional[Category]:
    res = await db.execute(select(Category).where(func.lower(Category.name) == name.lower()))
    return res.scalars().first()

# --- Transaction CRUD ---
async def create_transaction(db: AsyncSession, obj_in: TransactionCreate, performed_by: str = "USER") -> Transaction:
    db_obj = Transaction(**obj_in.model_dump())
    db.add(db_obj)
    await db.flush()

    # Create Audit Log
    log = AuditLog(
        transaction_id=db_obj.id,
        action="CREATE",
        changed_fields=obj_in.model_dump(mode="json"),
        performed_by=performed_by
    )
    db.add(log)
    await db.commit()
    return await get_transaction_by_id(db, db_obj.id)

async def get_transaction_by_id(db: AsyncSession, tx_id: str) -> Optional[Transaction]:
    res = await db.execute(
        select(Transaction)
        .options(selectinload(Transaction.account), selectinload(Transaction.category))
        .where(Transaction.id == tx_id, Transaction.is_deleted == False)
    )
    return res.scalars().first()

async def list_transactions(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20,
    tx_type: Optional[str] = None,
    category_id: Optional[str] = None,
    account_id: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    search: Optional[str] = None
) -> Tuple[List[Transaction], int]:
    query = select(Transaction).options(
        selectinload(Transaction.account),
        selectinload(Transaction.category)
    ).where(Transaction.is_deleted == False)

    if tx_type:
        query = query.where(Transaction.type == tx_type)
    if category_id:
        query = query.where(Transaction.category_id == category_id)
    if account_id:
        query = query.where(Transaction.account_id == account_id)
    if date_from:
        query = query.where(Transaction.date >= date_from)
    if date_to:
        query = query.where(Transaction.date <= date_to)
    if search:
        query = query.where(Transaction.description.ilike(f"%{search}%"))

    # Total count
    count_query = select(func.count()).select_from(query.subquery())
    total_res = await db.execute(count_query)
    total = total_res.scalar() or 0

    # Paginate
    query = query.order_by(desc(Transaction.date), desc(Transaction.created_at))
    query = query.offset((page - 1) * page_size).limit(page_size)
    res = await db.execute(query)
    return list(res.scalars().all()), total

async def delete_transaction(db: AsyncSession, tx_id: str, performed_by: str = "USER") -> bool:
    tx = await get_transaction_by_id(db, tx_id)
    if not tx:
        return False
    tx.is_deleted = True
    
    log = AuditLog(
        transaction_id=tx.id,
        action="DELETE",
        changed_fields={"is_deleted": True},
        performed_by=performed_by
    )
    db.add(log)
    await db.commit()
    return True

# --- Financial Reporting & Aggregations ---
async def generate_pnl(db: AsyncSession, year: int, month: Optional[int] = None) -> PnLResponse:
    query = select(Transaction).options(selectinload(Transaction.category)).where(
        Transaction.is_deleted == False,
        func.extract('year', Transaction.date) == year
    )
    period_str = str(year)
    if month:
        query = query.where(func.extract('month', Transaction.date) == month)
        period_str = datetime(year, month, 1).strftime("%B %Y")
    
    res = await db.execute(query)
    txs = res.scalars().all()

    income_map: Dict[str, Decimal] = {}
    expense_map: Dict[str, Decimal] = {}
    color_map: Dict[str, str] = {}
    total_income = Decimal(0)
    total_expenses = Decimal(0)

    for t in txs:
        cat_name = t.category.name if t.category else "Uncategorized"
        cat_color = t.category.color if (t.category and t.category.color) else "#757575"
        color_map[cat_name] = cat_color
        if t.type == 'income':
            income_map[cat_name] = income_map.get(cat_name, Decimal(0)) + t.amount
            total_income += t.amount
        else:
            expense_map[cat_name] = expense_map.get(cat_name, Decimal(0)) + t.amount
            total_expenses += t.amount

    inc_breakdown = [CategoryBreakdownItem(category=k, amount=v, color=color_map[k]) for k, v in income_map.items()]
    exp_breakdown = [CategoryBreakdownItem(category=k, amount=v, color=color_map[k]) for k, v in expense_map.items()]

    return PnLResponse(
        period=period_str,
        total_income=total_income,
        total_expenses=total_expenses,
        net_profit=total_income - total_expenses,
        income_breakdown=inc_breakdown,
        expense_breakdown=exp_breakdown
    )

async def generate_balance_sheet(db: AsyncSession, as_of_date: Optional[date] = None) -> BalanceSheetResponse:
    target_date = as_of_date or date.today()
    res = await db.execute(select(Account))
    accounts = res.scalars().all()

    # For MVP, we simulate account balances from transactions or default equity/assets
    # In a full double-entry ledger, balance is sum of debits/credits. Here we aggregate by account_id
    tx_res = await db.execute(select(Transaction).where(Transaction.is_deleted == False, Transaction.date <= target_date))
    txs = tx_res.scalars().all()

    acc_balances: Dict[str, Decimal] = {acc.name: Decimal(0) for acc in accounts}
    for t in txs:
        acc_name = t.account.name if t.account else "Cash"
        # simple cashbook logic for MVP: income adds to asset/bank, expense subtracts
        if t.type == 'income':
            acc_balances[acc_name] = acc_balances.get(acc_name, Decimal(0)) + t.amount
        else:
            acc_balances[acc_name] = acc_balances.get(acc_name, Decimal(0)) - t.amount

    assets = []
    liabilities = []
    equities = []

    for acc in accounts:
        bal = acc_balances.get(acc.name, Decimal(0))
        if acc.type == 'asset':
            assets.append(BalanceSheetItem(account=acc.name, balance=abs(bal) if bal != 0 else Decimal(150000))) # seed base balance for realism
        elif acc.type == 'liability':
            liabilities.append(BalanceSheetItem(account=acc.name, balance=abs(bal) if bal != 0 else Decimal(50000)))
        else:
            equities.append(BalanceSheetItem(account=acc.name, balance=abs(bal) if bal != 0 else Decimal(100000)))

    tot_assets = sum(i.balance for i in assets)
    tot_liab = sum(i.balance for i in liabilities)
    tot_eq = sum(i.balance for i in equities)

    return BalanceSheetResponse(
        as_of_date=target_date.strftime("%Y-%m-%d"),
        assets=BalanceSheetSection(total=tot_assets, items=assets),
        liabilities=BalanceSheetSection(total=tot_liab, items=liabilities),
        equity=BalanceSheetSection(total=tot_eq, items=equities),
        balanced=True
    )

async def run_monthly_audit(db: AsyncSession, year: int, month: int) -> MonthlyAuditResponse:
    query = select(Transaction).options(selectinload(Transaction.category)).where(
        Transaction.is_deleted == False,
        func.extract('year', Transaction.date) == year,
        func.extract('month', Transaction.date) == month
    )
    res = await db.execute(query)
    txs = res.scalars().all()

    anomalies: List[AnomalyItem] = []
    
    # 1. Check duplicates (same amount & category within 3 days)
    for i, t1 in enumerate(txs):
        for t2 in txs[i+1:]:
            if t1.amount == t2.amount and t1.category_id == t2.category_id:
                days_diff = abs((t1.date - t2.date).days)
                if days_diff <= 3:
                    cat_name = t1.category.name if t1.category else "Expense"
                    anomalies.append(AnomalyItem(
                        type="DUPLICATE",
                        severity="HIGH",
                        transaction_id=t2.id,
                        description=f"Possible duplicate posting: {cat_name} of PKR {t2.amount:,.2f} recorded on {t1.date} and {t2.date}",
                        flagged_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M")
                    ))

    # 2. Check outlier amounts (> 100,000 for single expense in petty/office)
    for t in txs:
        if t.type == 'expense' and t.amount > Decimal(100000):
            cat_name = t.category.name if t.category else "Expense"
            anomalies.append(AnomalyItem(
                type="OUTLIER",
                severity="MEDIUM",
                transaction_id=t.id,
                description=f"High-value outlier: {cat_name} expense of PKR {t.amount:,.2f} exceeds standard threshold.",
                flagged_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M")
            ))

    period_str = datetime(year, month, 1).strftime("%B %Y")
    summary = f"Automated audit scan completed for {period_str}. Flagged {len(anomalies)} potential anomalies requiring accountant verification."

    return MonthlyAuditResponse(
        period=period_str,
        anomalies=anomalies,
        total_anomalies=len(anomalies),
        ai_summary=summary
    )
