import os
from datetime import date
from decimal import Decimal
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from pydantic_ai import Agent, RunContext

from app.config import settings
from app.services import crud
from app.schemas.schemas import TransactionCreate, TransactionResponse, ChatMessage, ChatResponse

# Provide the API key for Pydantic-AI Google Provider
# If not present in Vercel env, provide a dummy key so the app doesn't crash on boot!
os.environ["GOOGLE_API_KEY"] = settings.GEMINI_API_KEY or "dummy_key"

agent = Agent(
    "google:gemini-2.5-flash",
    deps_type=AsyncSession,
)

@agent.system_prompt
def add_system_prompt(ctx: RunContext[AsyncSession]) -> str:
    return (
        f"You are an advanced multilingual AI Accounting & Finance Assistant for Cyber Nuts, powered by Gemini. "
        f"Today's date is {date.today()}. "
        "You perfectly understand English, Urdu, and Roman Urdu. "
        "You have tools to perform all accounting operations. When the user asks you to record a transaction, generate a P&L, balance sheet, or run an audit, YOU MUST use the appropriate tool before responding. "
        "Do not answer without pulling data via the tools first. "
        "If you record a transaction, confirm it concisely and tell them it was recorded successfully. "
        "If you pull a report, summarize the key numbers briefly for them."
    )

@agent.tool
async def generate_statement(ctx: RunContext[AsyncSession]) -> dict:
    """Use this tool when the user asks to download or view a full PDF or CSV statement."""
    pnl = await crud.generate_pnl(ctx.deps, date.today().year, date.today().month)
    return {"_tool_used": "generate_statement", "data": {"period": "all", "pnl": pnl.model_dump()}}

@agent.tool
async def record_transaction(ctx: RunContext[AsyncSession], amount: float, tx_type: str, category_name: str, description: str) -> dict:
    """Records an income or expense transaction. 
    Args:
        amount: The transaction amount (e.g., 1500)
        tx_type: Either 'income' or 'expense'
        category_name: Try to map to one of: Rent, Utilities, Salaries, Office Supplies, Marketing, Petty Cash, Miscellaneous, Sales, Service Fees.
        description: A short English or Roman Urdu description.
    """
    db = ctx.deps
    cats = await crud.get_categories(db)
    cat_obj = next((c for c in cats if c.name.lower() == category_name.lower()), cats[0] if cats else None)
    
    accs = await crud.get_accounts(db)
    cash_acc = next((a for a in accs if a.name.lower() in ["cash", "bank account", "bank"]), accs[0] if accs else None)
    
    if not cat_obj or not cash_acc:
        return {"error": "Categories or Accounts not initialized"}
        
    tx_in = TransactionCreate(
        date=date.today(),
        amount=Decimal(str(amount)),
        type=tx_type,
        description=f"AI: {description[:80]}",
        account_id=cash_acc.id,
        category_id=cat_obj.id,
        is_recurring=False
    )
    new_tx = await crud.create_transaction(db, tx_in, performed_by="AI_GEMINI")
    return {"_tool_used": "create_transaction", "data": TransactionResponse.model_validate(new_tx).model_dump()}

@agent.tool
async def generate_pnl_report(ctx: RunContext[AsyncSession], year: int, month: int) -> dict:
    """Generates the Profit and Loss statement for a specific month and year (e.g., 2026, 7)."""
    pnl = await crud.generate_pnl(ctx.deps, year, month)
    return {"_tool_used": "generate_pnl", "data": pnl.model_dump()}

@agent.tool
async def generate_balance_sheet(ctx: RunContext[AsyncSession]) -> dict:
    """Generates the Balance Sheet."""
    bs = await crud.generate_balance_sheet(ctx.deps, date.today())
    return {"_tool_used": "generate_balance_sheet", "data": bs.model_dump()}
    
@agent.tool
async def run_audit(ctx: RunContext[AsyncSession], year: int, month: int) -> dict:
    """Runs a monthly audit to detect anomalies, duplicates, and outliers."""
    audit_res = await crud.run_monthly_audit(ctx.deps, year, month)
    return {"_tool_used": "run_monthly_audit", "data": audit_res.model_dump()}

async def process_chat_message(
    db: AsyncSession,
    user_message: str,
    history: Optional[List[ChatMessage]] = None
) -> ChatResponse:
    """
    Processes a natural language chat message using native Gemini function calling.
    """
    try:
        if os.environ.get("GOOGLE_API_KEY") == "dummy_key":
            return ChatResponse(
                reply="Sorry, the Gemini AI is not configured. Please add your GEMINI_API_KEY in the Vercel Environment Variables.",
                suggested_actions=[]
            )
            
        result = await agent.run(user_message, deps=db)
        
        tool_used = None
        structured_data = None
        
        for msg in result.all_messages():
            if hasattr(msg, 'parts'):
                for part in msg.parts:
                    if hasattr(part, 'content') and isinstance(part.content, dict):
                        if "_tool_used" in part.content:
                            tool_used = part.content["_tool_used"]
                            structured_data = part.content.get("data")
                            
        return ChatResponse(
            reply=str(result.output),
            tool_used=tool_used,
            structured_data=structured_data
        )
    except Exception as e:
        return ChatResponse(reply=f"AI Internal Error: {str(e)}")
