from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services import crud
from app.schemas.schemas import ApiResponse, PnLResponse, BalanceSheetResponse

router = APIRouter()

@router.get("/reports/pnl", response_model=ApiResponse)
async def get_pnl_report(
    year: int = Query(date.today().year),
    month: Optional[int] = Query(date.today().month, ge=1, le=12),
    db: AsyncSession = Depends(get_db)
):
    pnl = await crud.generate_pnl(db, year, month)
    return ApiResponse(success=True, data=pnl)

@router.get("/reports/balance-sheet", response_model=ApiResponse)
async def get_balance_sheet_report(
    as_of_date: Optional[date] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    bs = await crud.generate_balance_sheet(db, as_of_date)
    return ApiResponse(success=True, data=bs)
