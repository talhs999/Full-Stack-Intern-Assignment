from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services import crud
from app.schemas.schemas import (
    ApiResponse, TransactionCreate, TransactionUpdate, TransactionResponse,
    TransactionListResponse, AccountResponse, CategoryResponse
)

router = APIRouter()

# --- Transactions Endpoints ---
@router.post("/transactions", response_model=ApiResponse)
async def create_transaction_endpoint(
    tx_in: TransactionCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        tx = await crud.create_transaction(db, tx_in, performed_by="USER_UI")
        return ApiResponse(success=True, data=TransactionResponse.model_validate(tx), message="Transaction created successfully")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/transactions", response_model=ApiResponse)
async def list_transactions_endpoint(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    type: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    account_id: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    items, total = await crud.list_transactions(
        db, page=page, page_size=page_size, tx_type=type,
        category_id=category_id, account_id=account_id,
        date_from=date_from, date_to=date_to, search=search
    )
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    res = TransactionListResponse(
        items=[TransactionResponse.model_validate(t) for t in items],
        total=total, page=page, page_size=page_size, total_pages=total_pages
    )
    return ApiResponse(success=True, data=res)

@router.get("/transactions/{id}", response_model=ApiResponse)
async def get_transaction_endpoint(id: str, db: AsyncSession = Depends(get_db)):
    tx = await crud.get_transaction_by_id(db, id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return ApiResponse(success=True, data=TransactionResponse.model_validate(tx))

@router.put("/transactions/{id}", response_model=ApiResponse)
async def update_transaction_endpoint(id: str, tx_in: TransactionUpdate, db: AsyncSession = Depends(get_db)):
    tx = await crud.update_transaction(db, id, tx_in, performed_by="USER_UI")
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found or deleted")
    return ApiResponse(success=True, data=TransactionResponse.model_validate(tx), message="Transaction updated successfully")

@router.delete("/transactions/{id}", response_model=ApiResponse)
async def delete_transaction_endpoint(id: str, db: AsyncSession = Depends(get_db)):
    success = await crud.delete_transaction(db, id, performed_by="USER_UI")
    if not success:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return ApiResponse(success=True, message="Transaction deleted successfully")

# --- Accounts & Categories Endpoints ---
@router.get("/accounts", response_model=ApiResponse)
async def list_accounts_endpoint(db: AsyncSession = Depends(get_db)):
    accs = await crud.get_accounts(db)
    return ApiResponse(success=True, data=[AccountResponse.model_validate(a) for a in accs])

@router.get("/categories", response_model=ApiResponse)
async def list_categories_endpoint(db: AsyncSession = Depends(get_db)):
    cats = await crud.get_categories(db)
    return ApiResponse(success=True, data=[CategoryResponse.model_validate(c) for c in cats])
