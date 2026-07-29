import asyncio
from app.database import AsyncSessionLocal
from app.services.crud import generate_pnl, generate_balance_sheet

async def run():
    async with AsyncSessionLocal() as db:
        pnl = await generate_pnl(db, 2026, 7)
        bs = await generate_balance_sheet(db)
        print("PnL Expenses:", pnl.total_expenses)
        print("PnL Income:", pnl.total_income)
        print("Assets:", bs.assets.total)

asyncio.run(run())
