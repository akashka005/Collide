from fastapi import APIRouter, Header, HTTPException
from app.services.matching_service import matching_service
from app.services.room_service import room_service
from app.schemas.match import QueueJoinRequest, QueueStatusResponse, MatchPartner
router = APIRouter(prefix="/matches", tags=["Matches"])
@router.post("/queue", response_model=QueueStatusResponse)
async def join_queue(req: QueueJoinRequest, x_user_id: str = Header(..., alias="X-User-Id")):
    from app.schemas.user import UserProfile
    profile = UserProfile(
        id=x_user_id,
        pseudonym="User",
        avatarUrl="/assets/landing/avatar-1.webp",
        interests=req.interests,
        language=req.language,
        country=req.country or "Earth",
    )
    room_id, partner = await matching_service.add_to_queue(profile, req.mode, req.algorithm)
    if room_id and partner:
        return QueueStatusResponse(
            status="connected",
            roomId=room_id,
            partner=partner,
            queueDepth=0,
        )
    depth = await matching_service.get_queue_depth(req.mode)
    return QueueStatusResponse(
        status="searching",
        roomId=None,
        partner=None,
        queueDepth=depth,
    )


@router.delete("/queue")
async def cancel_queue(x_user_id: str = Header(..., alias="X-User-Id")):
    await matching_service.remove_from_queue(x_user_id)
    return {"status": "idle"}


@router.get("/current")
async def get_current_match(x_user_id: str = Header(..., alias="X-User-Id")):
    room_id = await room_service.get_user_room_id(x_user_id)
    if not room_id:
        return {"status": "idle", "roomId": None, "partner": None}

    partner_data = await room_service.get_partner_profile(x_user_id)
    return {
        "status": "connected",
        "roomId": room_id,
        "partner": partner_data,
    }


@router.post("/skip")
async def skip_match(x_user_id: str = Header(..., alias="X-User-Id")):
    room_id = await room_service.get_user_room_id(x_user_id)
    if room_id:
        await room_service.close_room(room_id)
    return {"status": "skipped"}


@router.post("/disconnect")
async def disconnect_match(x_user_id: str = Header(..., alias="X-User-Id")):
    room_id = await room_service.get_user_room_id(x_user_id)
    if room_id:
        await room_service.close_room(room_id)
    return {"status": "ended"}