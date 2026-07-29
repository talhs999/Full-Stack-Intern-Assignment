from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database import get_db
from app.services import crud
from app.models.models import AuditLog
from app.schemas.schemas import ApiResponse, AuditLogResponse, MonthlyAuditResponse

router = APIRouter()

@router.get("/audit/logs", response_model=ApiResponse)
async def get_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(AuditLog).order_by(desc(AuditLog.performed_at)).limit(limit))
    logs = res.scalars().all()
    return ApiResponse(success=True, data=[AuditLogResponse.model_validate(l) for l in logs])

@router.get("/audit/anomalies", response_model=ApiResponse)
async def get_audit_anomalies(
    year: Optional[int] = Query(None),
    month: Optional[int] = Query(None, ge=1, le=12),
    db: AsyncSession = Depends(get_db)
):
    actual_year = year or date.today().year
    actual_month = month or date.today().month
    audit_res = await crud.run_monthly_audit(db, actual_year, actual_month)
    return ApiResponse(success=True, data=audit_res)
