import json
from typing import Optional, Dict, Any, List
from app.services.redis_client import get_redis


class RoomService:
    async def get_user_room_id(self, user_id: str) -> Optional[str]:
        redis = await get_redis()
        return await redis.get(f"user_room:{user_id}")

    async def get_room(self, room_id: str) -> Optional[Dict[str, Any]]:
        redis = await get_redis()
        raw = await redis.get(f"room:{room_id}")
        return json.loads(raw) if raw else None

    async def get_partner_id(self, user_id: str, room_id: str) -> Optional[str]:
        room = await self.get_room(room_id)
        if not room:
            return None
        users: List[str] = room.get("users", [])
        for u in users:
            if u != user_id:
                return u
        return None

    async def get_partner_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        redis = await get_redis()
        raw = await redis.get(f"partner:{user_id}")
        return json.loads(raw) if raw else None

    async def close_room(self, room_id: str) -> List[str]:
        """
        Cleans up room from Redis and returns the list of affected user IDs.
        """
        redis = await get_redis()
        room = await self.get_room(room_id)
        if not room:
            return []

        users = room.get("users", [])
        for u in users:
            await redis.delete(f"user_room:{u}")
            await redis.delete(f"partner:{u}")
        await redis.delete(f"room:{room_id}")
        return users


room_service = RoomService()

