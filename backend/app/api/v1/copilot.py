from typing import List, Optional
from fastapi import APIRouter, Query
from app.ai.copilot import copilot_service
router = APIRouter(prefix="/copilot", tags=["AI Copilot"])
@router.get("/icebreakers", response_model=List[str])
async def get_copilot_icebreakers(interests: Optional[str] = Query(None)):
    interest_list = [i.strip() for i in interests.split(",")] if interests else None
    return await copilot_service.generate_icebreakers(interest_list)
