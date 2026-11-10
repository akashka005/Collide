import time
import uuid
from typing import List
from fastapi import APIRouter, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.db.models import SafetyReport as DBSafetyReport
from app.schemas.safety import SafetyReport, SafetyReportCreate
from app.services.redis_client import get_redis
from app.services.room_service import room_service
from app.realtime.connection_manager import connection_manager

router = APIRouter(prefix="/reports", tags=["Safety & Reports"])


@router.post("", response_model=SafetyReport)
async def submit_report(
    req: SafetyReportCreate,
    x_user_id: str = Header(..., alias="X-User-Id"),
    db: AsyncSession = Depends(get_db)
):
    report_id = f"rep-{uuid.uuid4().hex[:12]}"
    now = int(time.time() * 1000)

    db_report = DBSafetyReport(
        id=report_id,
        reported_user_id=req.reportedUserId,
        reported_user_name=req.reportedUserName,
        reporter_id=x_user_id,
        category=req.category,
        notes=req.notes or "",
        status="pending",
        created_at=now,
    )
    db.add(db_report)
    await db.commit()
    await db.refresh(db_report)
    redis = await get_redis()
    await redis.sadd(f"blocked:{x_user_id}", req.reportedUserId)
    room_id = await room_service.get_user_room_id(x_user_id)
    if room_id:
        partner_id = await room_service.get_partner_id(x_user_id, room_id)
        await room_service.close_room(room_id)
        if partner_id:
            await connection_manager.send_to_user(partner_id, {
                "event": "match.ended",
                "payload": {"reason": "session_terminated_by_safety"},
                "timestamp": now
            })

    return SafetyReport(
        id=db_report.id,
        reportedUserId=db_report.reported_user_id,
        reportedUserName=db_report.reported_user_name,
        reporterId=db_report.reporter_id,
        category=db_report.category,
        notes=db_report.notes,
        timestamp=db_report.created_at,
        status=db_report.status,
    )


@router.get("", response_model=List[SafetyReport])
async def list_reports(
    x_user_id: str = Header(..., alias="X-User-Id"),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(DBSafetyReport).where(DBSafetyReport.reporter_id == x_user_id).order_by(DBSafetyReport.created_at.desc())
    result = await db.execute(stmt)
    reports = result.scalars().all()
    return [
        SafetyReport(
            id=r.id,
            reportedUserId=r.reported_user_id,
            reportedUserName=r.reported_user_name,
            reporterId=r.reporter_id,
            category=r.category,
            notes=r.notes,
            timestamp=r.created_at,
            status=r.status,
        )
        for r in reports
    ]

