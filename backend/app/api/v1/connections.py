import time
import uuid
from typing import List
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.db.session import get_db
from app.db.models import MutualConnection as DBMutualConnection
from app.schemas.safety import MutualConnection

router = APIRouter(prefix="/connections", tags=["Mutual Connections"])
@router.get("", response_model=List[MutualConnection])
async def get_connections(
    x_user_id: str = Header(..., alias="X-User-Id"),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(DBMutualConnection).where(DBMutualConnection.user_id == x_user_id).order_by(DBMutualConnection.connected_at.desc())
    result = await db.execute(stmt)
    conns = result.scalars().all()
    return [
        MutualConnection(
            id=c.id,
            partnerId=c.partner_id,
            partnerName=c.partner_name,
            partnerAvatar=c.partner_avatar,
            partnerCountry=c.partner_country,
            sharedInterests=c.shared_interests or [],
            connectedAt=c.connected_at,
        )
        for c in conns
    ]


@router.post("/accept", response_model=MutualConnection)
async def accept_connection(
    req: MutualConnection,
    x_user_id: str = Header(..., alias="X-User-Id"),
    db: AsyncSession = Depends(get_db)
):
    now = int(time.time() * 1000)
    conn_id = f"conn-{uuid.uuid4().hex[:12]}"

    db_conn = DBMutualConnection(
        id=conn_id,
        user_id=x_user_id,
        partner_id=req.partnerId,
        partner_name=req.partnerName,
        partner_avatar=req.partnerAvatar,
        partner_country=req.partnerCountry,
        shared_interests=req.sharedInterests,
        connected_at=now,
    )
    db.add(db_conn)
    try:
        await db.commit()
        await db.refresh(db_conn)
    except Exception:
        await db.rollback()

    return MutualConnection(
        id=db_conn.id,
        partnerId=db_conn.partner_id,
        partnerName=db_conn.partner_name,
        partnerAvatar=db_conn.partner_avatar,
        partnerCountry=db_conn.partner_country,
        sharedInterests=db_conn.shared_interests or [],
        connectedAt=db_conn.connected_at,
    )


@router.delete("/{partner_id}")
async def remove_connection(
    partner_id: str,
    x_user_id: str = Header(..., alias="X-User-Id"),
    db: AsyncSession = Depends(get_db)
):
    stmt = delete(DBMutualConnection).where(
        (DBMutualConnection.user_id == x_user_id) & (DBMutualConnection.partner_id == partner_id)
    )
    await db.execute(stmt)
    await db.commit()
    return {"status": "deleted"}
