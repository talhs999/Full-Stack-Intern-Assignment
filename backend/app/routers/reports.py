from typing import Optional
from datetime import date, timedelta
from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services import crud
from app.services.crud import compute_pnl_from_transactions
from app.services.export import generate_pdf_statement_bytes, generate_csv_statement_string
from app.schemas.schemas import ApiResponse, PnLResponse, BalanceSheetResponse, TransactionResponse

router = APIRouter()

@router.get("/reports/pnl", response_model=ApiResponse)
async def get_pnl_report(
    year: Optional[int] = Query(None),
    month: Optional[int] = Query(None, ge=1, le=12),
    db: AsyncSession = Depends(get_db)
):
    actual_year = year or date.today().year
    actual_month = month or date.today().month
    pnl = await crud.generate_pnl(db, actual_year, actual_month)
    return ApiResponse(success=True, data=pnl)

@router.get("/reports/balance-sheet", response_model=ApiResponse)
async def get_balance_sheet_report(
    as_of_date: Optional[date] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    bs = await crud.generate_balance_sheet(db, as_of_date)
    return ApiResponse(success=True, data=bs)

@router.get("/reports/statement/pdf")
async def download_pdf_statement(
    period: str = Query("month", description="Period: today, week, month, or all"),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    today = date.today()
    label = "All Time History"
    
    if period == "today" or period == "din":
        date_from = today
        date_to = today
        label = f"Daily Statement ({today})"
    elif period == "week" or period == "hafta":
        date_from = today - timedelta(days=7)
        date_to = today
        label = f"Weekly Statement ({date_from} to {date_to})"
    elif period == "month" or period == "mahina":
        date_from = date(today.year, today.month, 1)
        date_to = today
        label = f"Monthly Statement ({today.strftime('%B %Y')})"
    elif period == "custom" and (date_from or date_to):
        label = f"Custom Period ({date_from or 'Start'} to {date_to or 'End'})"
    else:
        date_from = None
        date_to = None
        label = "Complete All-Time Statement"

    txs, _ = await crud.list_transactions(db, page=1, page_size=10000, date_from=date_from, date_to=date_to)
    tx_responses = [TransactionResponse.model_validate(t) for t in txs]
    
    # Compute PnL summary from the SAME filtered transactions (not a separate month query)
    pnl = compute_pnl_from_transactions(txs, label)
    
    pdf_bytes = generate_pdf_statement_bytes(tx_responses, pnl, label)
    filename = f"CyberNuts_Statement_{period}_{today.strftime('%Y%m%d')}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

@router.get("/reports/statement/csv")
async def download_csv_statement(
    period: str = Query("all", description="Period: today, week, month, or all"),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    today = date.today()
    label = "All Time History"
    
    if period == "today" or period == "din":
        date_from = today
        date_to = today
        label = f"Daily Statement ({today})"
    elif period == "week" or period == "hafta":
        date_from = today - timedelta(days=7)
        date_to = today
        label = f"Weekly Statement ({date_from} to {date_to})"
    elif period == "month" or period == "mahina":
        date_from = date(today.year, today.month, 1)
        date_to = today
        label = f"Monthly Statement ({today.strftime('%B %Y')})"
    elif period == "custom" and (date_from or date_to):
        label = f"Custom Period ({date_from or 'Start'} to {date_to or 'End'})"
    else:
        date_from = None
        date_to = None
        label = "Complete All-Time Statement"

    txs, _ = await crud.list_transactions(db, page=1, page_size=10000, date_from=date_from, date_to=date_to)
    tx_responses = [TransactionResponse.model_validate(t) for t in txs]
    # Compute PnL summary from the SAME filtered transactions (not a separate month query)
    pnl = compute_pnl_from_transactions(txs, label)
    
    csv_str = generate_csv_statement_string(tx_responses, pnl, label)
    filename = f"CyberNuts_Statement_{period}_{today.strftime('%Y%m%d')}.csv"
    
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

