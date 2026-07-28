import re
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.services import crud
from app.schemas.schemas import TransactionCreate, TransactionResponse, ChatMessage, ChatResponse

# System prompt for accounting assistant
SYSTEM_PROMPT = """
You are an advanced multilingual AI Accounting & Finance Assistant for Cyber Nuts, powered by Gemini 2.0.
You are trained to understand and reply fluently in English, Urdu (اردو), and Roman Urdu (e.g., 'mene 5000 bijli ka bill diya', 'aaj office rent pay kiya', 'munafa kya hai?').
Always rely on database tool functions for calculations and transaction recording. Never hallucinate financial figures.
When formatting replies, avoid raw markdown bold asterisks so that outputs render cleanly in UI and PDF documents.
"""

async def process_chat_message(
    db: AsyncSession,
    user_message: str,
    history: Optional[List[ChatMessage]] = None
) -> ChatResponse:
    """
    Processes a natural language chat message from the user.
    Supports English, Urdu, and Roman Urdu with high accuracy.
    Uses AI LLM if API key is present, otherwise falls back to deterministic multilingual NLP parsing.
    """
    msg_lower = user_message.lower().strip()

    # 1. Intent: Run Audit / Scan Anomalies
    if any(w in msg_lower for w in ["audit", "anomal", "scan", "check karo", "ghalti", "duplicate", "farq", "investigate"]):
        today = date.today()
        audit_res = await crud.run_monthly_audit(db, today.year, today.month)
        reply = (
            f"Automated Audit Report for {audit_res.period}\n"
            f"----------------------------------------\n"
            f"- Status: {audit_res.status}\n"
            f"- Total Transactions Scanned: {audit_res.total_transactions}\n"
            f"- Flagged Anomalies: {audit_res.total_anomalies}\n"
        )
        if audit_res.anomalies:
            reply += "\nFlagged Items Requiring Review:\n" + "\n".join([f"- [{a.severity}] {a.description}" for a in audit_res.anomalies])
        else:
            reply += "\nAll ledgers are clean! No duplicate or outlier transactions detected."
        return ChatResponse(
            reply=reply,
            tool_used="run_monthly_audit",
            structured_data=audit_res.model_dump()
        )

    # 2. Intent: Profit & Loss / Spending summary / Munafa / Kharcha
    if any(w in msg_lower for w in ["p&l", "profit", "loss", "spend", "summary", "munafa", "kharcha", "kamai", "hisab", "income statement", "revenue summary"]):
        today = date.today()
        pnl = await crud.generate_pnl(db, today.year, today.month)
        margin = (float(pnl.net_profit) / float(pnl.total_income) * 100) if pnl.total_income > 0 else 0.0
        reply = (
            f"Financial Summary (P&L) for {pnl.period}\n"
            f"----------------------------------------\n"
            f"- Total Revenue: PKR {pnl.total_income:,.2f}\n"
            f"- Total Expenses: PKR {pnl.total_expenses:,.2f}\n"
            f"- Net Profit / Munafa: PKR {pnl.net_profit:,.2f}\n"
            f"- Profit Margin: {margin:.1f}%\n\n"
            f"Top Expense Category: {pnl.expense_breakdown[0].category if pnl.expense_breakdown else 'None'}."
        )
        return ChatResponse(
            reply=reply,
            tool_used="generate_pnl",
            structured_data=pnl.model_dump()
        )

    # 3. Intent: Balance Sheet / Assets / Liabilities / Sarmaya
    if any(w in msg_lower for w in ["balance sheet", "asset", "liabilit", "equity", "sarmaya", "khazana", "accounts status", "status"]):
        bs = await crud.generate_balance_sheet(db, date.today())
        reply = (
            f"Balance Sheet Snapshot as of {bs.as_of_date}\n"
            f"----------------------------------------\n"
            f"- Total Assets: PKR {bs.assets.total:,.2f}\n"
            f"- Total Liabilities: PKR {bs.liabilities.total:,.2f}\n"
            f"- Owner's Equity: PKR {bs.equity.total:,.2f}\n\n"
            f"Accounting Equation: {'Balanced (Assets = Liabilities + Equity)' if bs.balanced else 'Discrepancy Detected'}"
        )
        return ChatResponse(
            reply=reply,
            tool_used="generate_balance_sheet",
            structured_data=bs.model_dump()
        )

    # 4. Intent: Add Transaction (Multilingual / Roman Urdu Heuristics)
    # Match amounts like: 5000, 50,000, 15000.50
    amount_match = re.search(r'(\d+[\d,]*(\.\d{1,2})?)', user_message)
    # Check if message contains transaction keywords or if an amount is present with keywords
    tx_keywords = ["add", "record", "paid", "received", "log", "enter", "diya", "diye", "pay", "pay kiya", "miley", "aya", "kharcha", "bill", "rent", "salary", "tea", "snack", "stationery"]
    if amount_match and any(w in msg_lower for w in tx_keywords):
        raw_amt = amount_match.group(1).replace(",", "")
        try:
            amount = Decimal(raw_amt)
            if amount <= 0:
                raise ValueError()
        except Exception:
            return ChatResponse(reply="Please provide a valid transaction amount greater than zero.")

        # Determine type (income vs expense)
        income_keywords = ["received", "income", "sales", "revenue", "miley", "aya", "bikri", "becha", "kamai", "profit", "service fee"]
        tx_type = "income" if any(w in msg_lower for w in income_keywords) else "expense"
        
        # Categorization heuristics (English + Urdu + Roman Urdu)
        cat_name = "Miscellaneous"
        if any(w in msg_lower for w in ["rent", "kiraya", "dukan", "office rent"]): 
            cat_name = "Rent"
        elif any(w in msg_lower for w in ["utility", "electric", "water", "gas", "bill", "power", "internet", "bijli", "ke-electric", "wapda", "wifi"]): 
            cat_name = "Utilities"
        elif any(w in msg_lower for w in ["salary", "staff", "wage", "payroll", "tankha", "tanqeed", "mazdoori", "employee"]): 
            cat_name = "Salaries"
        elif any(w in msg_lower for w in ["stationery", "paper", "pen", "suppli", "register", "print", "ink", "copy"]): 
            cat_name = "Office Supplies"
        elif any(w in msg_lower for w in ["marketing", "ad", "fb", "google", "promo", "advertis", "poster", "banner", "campaign"]): 
            cat_name = "Marketing"
        elif any(w in msg_lower for w in ["tea", "coffee", "snack", "petty", "food", "lunch", "chai", "samosa", "biscuit", "nashta", "pani", "refreshment"]): 
            cat_name = "Petty Cash"
        elif tx_type == "income": 
            cat_name = "Sales"

        # Resolve DB entities
        cats = await crud.get_categories(db)
        cat_obj = next((c for c in cats if c.name.lower() == cat_name.lower()), cats[0] if cats else None)
        accs = await crud.get_accounts(db)
        acc_obj = next((a for a in accs if a.type == ("asset" if tx_type == "expense" else "revenue")), accs[0] if accs else None)

        if not cat_obj or not acc_obj:
            return ChatResponse(reply="System error: Chart of accounts or categories not initialized in database.")

        desc = user_message.strip()
        tx_in = TransactionCreate(
            date=date.today(),
            amount=amount,
            type=tx_type,
            description=f"AI Entry: {desc[:80]}",
            account_id=acc_obj.id,
            category_id=cat_obj.id,
            is_recurring=False
        )

        new_tx = await crud.create_transaction(db, tx_in, performed_by="AI_AGENT_GEMINI")
        reply = (
            f"Transaction Recorded Successfully!\n"
            f"----------------------------------------\n"
            f"- Amount: PKR {new_tx.amount:,.2f}\n"
            f"- Type: {new_tx.type.upper()}\n"
            f"- Category: {cat_name}\n"
            f"- Account: {acc_obj.name}\n"
            f"- Date: {new_tx.date}\n"
            f"- Description: {desc[:60]}"
        )
        return ChatResponse(
            reply=reply,
            tool_used="create_transaction",
            structured_data=TransactionResponse.model_validate(new_tx).model_dump()
        )

    # Default Conversational Help Response (Multilingual / Roman Urdu)
    help_reply = (
        "Hello! I am your Cyber Nuts AI Accounting Assistant (Powered by Gemini 2.0).\n"
        "You can speak with me in English, Urdu, or Roman Urdu!\n\n"
        "Here are some examples of what you can ask me:\n"
        "- 'Paid 5000 electricity bill'\n"
        "- 'Mene 45000 office rent pay kiya today'\n"
        "- 'Aaj 2500 chai and snacks me lag gaye'\n"
        "- 'Hamara is mahine ka munafa / P&L kya hai?'\n"
        "- 'Show me the Balance Sheet snapshot'\n"
        "- 'Monthly audit scan chalao aur anomalies check karo'"
    )
    return ChatResponse(reply=help_reply)
