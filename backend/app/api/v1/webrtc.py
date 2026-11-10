from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(prefix="/webrtc", tags=["WebRTC"])


@router.get("/ice-servers")
async def get_ice_servers():
    ice_servers = [
        {"urls": [settings.STUN_SERVER]},
    ]
    if settings.TURN_SERVER:
        turn_config = {
            "urls": [settings.TURN_SERVER],
            "username": settings.TURN_USERNAME,
            "credential": settings.TURN_CREDENTIAL,
        }
        ice_servers.append(turn_config)

    return {"iceServers": ice_servers}