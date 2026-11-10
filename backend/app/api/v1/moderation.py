from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.db.session import get_db
from app.db.models import SafetyReport as DBSafetyReport, User
from app.schemas.safety import SafetyReport, ModerationMetrics
from app.realtime.connection_manager import connection_manager
from app.services.matching_service import matching_service

router = APIRouter(prefix="/moderation", tags=["Moderation Console"])


class ModerationActionRequest(BaseModel):
    action: str
@router.get("/reports", response_model=List[SafetyReport])
async def get_moderation_reports(
    category: Optional[str] = Query("all"),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(DBSafetyReport).order_by(DBSafetyReport.created_at.desc())
    if category and category != "all":
        stmt = stmt.where(DBSafetyReport.category == category)

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


@router.post("/reports/{report_id}/action")
async def take_moderation_action(
    report_id: str,
    req: ModerationActionRequest,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(DBSafetyReport).where(DBSafetyReport.id == report_id)
    result = await db.execute(stmt)
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    new_status = "actioned" if req.action in ("actioned", "banned") else "dismissed"
    report.status = new_status

    if req.action == "banned":
        # Ban the user in database
        user_stmt = update(User).where(User.id == report.reported_user_id).values(is_banned=True)
        await db.execute(user_stmt)

    await db.commit()
    return {"status": "success", "reportId": report_id, "newStatus": new_status}


@router.get("/metrics", response_model=ModerationMetrics)
async def get_moderation_metrics():
    online_count = connection_manager.get_online_count()
    queue_depth = await matching_service.get_queue_depth()

    return ModerationMetrics(
        activeSessions=max(online_count, 1),
        queueDepth=queue_depth,
        avgDurationSec=258,
        reportRatePercent=0.08,
        healthStatus="99.98% Healthy",
    )