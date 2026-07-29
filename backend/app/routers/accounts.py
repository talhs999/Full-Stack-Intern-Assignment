from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.schemas.schemas import AccountResponse, AccountUpdate, ApiResponse
from app.services import crud

router = APIRouter()

@router.get("/", response_model=ApiResponse)
async def list_accounts(db: AsyncSession = Depends(get_db)):
    accounts = await crud.get_accounts(db)
    return ApiResponse(data=[AccountResponse.model_validate(a) for a in accounts])

@router.put("/{account_id}", response_model=ApiResponse)
async def update_account_balance(account_id: str, obj_in: AccountUpdate, db: AsyncSession = Depends(get_db)):
    account = await crud.update_account(db, account_id, obj_in)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return ApiResponse(data=AccountResponse.model_validate(account), message="Opening balance updated successfully")
