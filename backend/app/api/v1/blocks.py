import time
import uuid
from typing import List
from fastapi import APIRouter, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.db.models import UserBlock
from app.schemas.safety import BlockRecord, BlockCreate
from app.services.redis_client import get_redis
from app.services.room_service import room_service
from app.realtime.connection_manager import connection_manager

router = APIRouter(prefix="/blocks", tags=["Safety & Blocks"])


@router.post("", response_model=BlockRecord)
async def block_user(
    req: BlockCreate,
    x_user_id: str = Header(..., alias="X-User-Id"),
    db: AsyncSession = Depends(get_db)
):
    block_id = f"blk-{uuid.uuid4().hex[:12]}"
    now = int(time.time() * 1000)
    db_block = UserBlock(
        id=block_id,
        blocker_id=x_user_id,
        blocked_user_id=req.blockedUserId,
        blocked_user_name=req.blockedUserName,
        reason=req.reason or "Blocked by user",
        created_at=now,
    )
    db.add(db_block)
    try:
        await db.commit()
        await db.refresh(db_block)
    except Exception:
        await db.rollback()
    redis = await get_redis()
    await redis.sadd(f"blocked:{x_user_id}", req.blockedUserId)
    room_id = await room_service.get_user_room_id(x_user_id)
    if room_id:
        partner_id = await room_service.get_partner_id(x_user_id, room_id)
        await room_service.close_room(room_id)
        if partner_id:
            await connection_manager.send_to_user(partner_id, {
                "event": "match.ended",
                "payload": {"reason": "partner_blocked"},
                "timestamp": now
            })

    return BlockRecord(
        blockedUserId=req.blockedUserId,
        blockedUserName=req.blockedUserName,
        timestamp=now,
        reason=req.reason,
    )


@router.get("", response_model=List[BlockRecord])
async def list_blocks(
    x_user_id: str = Header(..., alias="X-User-Id"),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(UserBlock).where(UserBlock.blocker_id == x_user_id).order_by(UserBlock.created_at.desc())
    result = await db.execute(stmt)
    records = result.scalars().all()
    return [
        BlockRecord(
            blockedUserId=b.blocked_user_id,
            blockedUserName=b.blocked_user_name,
            timestamp=b.created_at,
            reason=b.reason,
        )
        for b in records
    ]