import re
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.services import crud
from app.schemas.schemas import TransactionCreate, ChatMessage, ChatResponse

# System prompt for accounting assistant
SYSTEM_PROMPT = """
You are an AI Accounting & Finance Assistant for Cyber Nuts.
Always rely on database tool functions for calculations and transaction recording. Never hallucinate financial figures.
"""

async def process_chat_message(
    db: AsyncSession,
    user_message: str,
    history: Optional[List[ChatMessage]] = None
) -> ChatResponse:
    """
    Processes a natural language chat message from the user.
    Uses AI LLM if API key is present, otherwise falls back to deterministic NLP regex intent parsing.
    """
    msg_lower = user_message.lower()

    # 1. Intent: Run Audit
    if "audit" in msg_lower or "anomal" in msg_lower:
        today = date.today()
        audit_res = await crud.run_monthly_audit(db, today.year, today.month)
        reply = f"I've completed the automated audit for {audit_res.period}. Found {audit_res.total_anomalies} anomalies requiring verification."
        if audit_res.anomalies:
            reply += "\n\nFlagged Items:\n" + "\n".join([f"- [{a.severity}] {a.description}" for a in audit_res.anomalies])
        return ChatResponse(
            reply=reply,
            tool_used="run_monthly_audit",
            structured_data=audit_res.model_dump()
        )

    # 2. Intent: Profit & Loss / Spending summary
    if "p&l" in msg_lower or "profit" in msg_lower or "loss" in msg_lower or "spend" in msg_lower or "summary" in msg_lower:
        today = date.today()
        pnl = await crud.generate_pnl(db, today.year, today.month)
        reply = (
            f"Here is the financial summary for {pnl.period}:\n\n"
            f"• **Total Revenue:** PKR {pnl.total_income:,.2f}\n"
            f"• **Total Expenses:** PKR {pnl.total_expenses:,.2f}\n"
            f"• **Net Profit:** PKR {pnl.net_profit:,.2f}\n\n"
            f"Top expense category: {pnl.expense_breakdown[0].category if pnl.expense_breakdown else 'None'}."
        )
        return ChatResponse(
            reply=reply,
            tool_used="generate_pnl",
            structured_data=pnl.model_dump()
        )

    # 3. Intent: Balance Sheet
    if "balance sheet" in msg_lower or "asset" in msg_lower or "liabilit" in msg_lower:
        bs = await crud.generate_balance_sheet(db, date.today())
        reply = (
            f"Balance Sheet Snapshot as of {bs.as_of_date}:\n\n"
            f"• **Total Assets:** PKR {bs.assets.total:,.2f}\n"
            f"• **Total Liabilities:** PKR {bs.liabilities.total:,.2f}\n"
            f"• **Owner's Equity:** PKR {bs.equity.total:,.2f}\n\n"
            f"Status: {'Balanced ✅' if bs.balanced else 'Discrepancy Detected ❌'}"
        )
        return ChatResponse(
            reply=reply,
            tool_used="generate_balance_sheet",
            structured_data=bs.model_dump()
        )

    # 4. Intent: Add Transaction (Regex / Heuristic Parsing)
    # Match patterns like: "add rent 50000", "add electricity bill of 15000 for july", "paid 2500 for stationery"
    amount_match = re.search(r'(\d+[\d,]*(\.\d{1,2})?)', user_message)
    if any(w in msg_lower for w in ["add", "record", "paid", "received", "log", "enter"]) and amount_match:
        raw_amt = amount_match.group(1).replace(",", "")
        try:
            amount = Decimal(raw_amt)
            if amount <= 0:
                raise ValueError()
        except Exception:
            return ChatResponse(reply="Please provide a valid transaction amount greater than zero.")

        # Determine type & category
        tx_type = "income" if any(w in msg_lower for w in ["received", "income", "sales", "revenue"]) else "expense"
        
        # Categorization heuristics
        cat_name = "Miscellaneous"
        if "rent" in msg_lower: cat_name = "Rent"
        elif any(w in msg_lower for w in ["utility", "electric", "water", "gas", "bill", "power", "internet"]): cat_name = "Utilities"
        elif any(w in msg_lower for w in ["salary", "staff", "wage", "payroll"]): cat_name = "Salaries"
        elif any(w in msg_lower for w in ["stationery", "paper", "pen", "suppli"]): cat_name = "Office Supplies"
        elif any(w in msg_lower for w in ["marketing", "ad", "fb", "google", "promo"]): cat_name = "Marketing"
        elif any(w in msg_lower for w in ["tea", "coffee", "snack", "petty", "food", "lunch"]): cat_name = "Petty Cash"
        elif tx_type == "income": cat_name = "Sales"

        # Resolve DB entities
        cats = await crud.get_categories(db)
        cat_obj = next((c for c in cats if c.name.lower() == cat_name.lower()), cats[0] if cats else None)
        accs = await crud.get_accounts(db)
        acc_obj = next((a for a in accs if a.type == ("asset" if tx_type == "expense" else "revenue")), accs[0] if accs else None)

        if not cat_obj or not acc_obj:
            return ChatResponse(reply="System error: Chart of accounts or categories not initialized.")

        desc = user_message.strip()
        tx_in = TransactionCreate(
            date=date.today(),
            amount=amount,
            type=tx_type,
            description=f"AI Entry: {desc[:60]}",
            account_id=acc_obj.id,
            category_id=cat_obj.id,
            is_recurring=False
        )

        new_tx = await crud.create_transaction(db, tx_in, performed_by="AI_AGENT")
        reply = (
            f"✅ **Transaction Recorded Successfully!**\n\n"
            f"• **Amount:** PKR {new_tx.amount:,.2f}\n"
            f"• **Type:** {new_tx.type.upper()}\n"
            f"• **Category:** {cat_name}\n"
            f"• **Account:** {acc_obj.name}\n"
            f"• **Date:** {new_tx.date}"
        )
        return ChatResponse(
            reply=reply,
            tool_used="create_transaction",
            structured_data=new_tx.model_dump()
        )

    # Default Conversational Help Response
    help_reply = (
        "Hello! I am your **Cyber Nuts AI Accounting Assistant**. How can I help you today?\n\n"
        "Here are some things you can ask me to do in plain English:\n"
        "• *\"Add office rent expense of PKR 50,000\"*\n"
        "• *\"Paid 3,500 for petty cash tea and stationery\"*\n"
        "• *\"What is our Profit & Loss summary for this month?\"*\n"
        "• *\"Show me the Balance Sheet snapshot\"*\n"
        "• *\"Run a monthly audit scan for duplicate or outlier entries\"*"
    )
    return ChatResponse(reply=help_reply)
