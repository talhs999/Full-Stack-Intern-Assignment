from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.agent import process_chat_message
from app.schemas.schemas import ApiResponse, ChatRequest, ChatResponse

router = APIRouter()

@router.post("/agent/chat", response_model=ApiResponse)
async def chat_with_agent(
    req: ChatRequest,
    db: AsyncSession = Depends(get_db)
):
    chat_res = await process_chat_message(db, req.message, req.conversation_history)
    return ApiResponse(success=True, data=chat_res)
