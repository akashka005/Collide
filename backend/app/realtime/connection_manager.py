from typing import Dict, Set, Optional, Any
from fastapi import WebSocket
from app.core.logging import logger


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.room_members: Dict[str, Set[str]] = {}
    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"User {user_id} connected via WebSocket.")
    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logger.info(f"User {user_id} disconnected from WebSocket.")
        for room_id, members in list(self.room_members.items()):
            if user_id in members:
                members.discard(user_id)
                if not members:
                    del self.room_members[room_id]

    def join_room(self, room_id: str, user_id: str):
        if room_id not in self.room_members:
            self.room_members[room_id] = set()
        self.room_members[room_id].add(user_id)

    def leave_room(self, room_id: str, user_id: str):
        if room_id in self.room_members:
            self.room_members[room_id].discard(user_id)
            if not self.room_members[room_id]:
                del self.room_members[room_id]

    async def send_to_user(self, user_id: str, message: Dict[str, Any]):
        websocket = self.active_connections.get(user_id)
        if websocket:
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.warning(f"Error sending message to {user_id}: {e}")

    async def broadcast_to_room(self, room_id: str, message: Dict[str, Any], exclude_user_id: Optional[str] = None):
        members = self.room_members.get(room_id, set())
        for user_id in list(members):
            if exclude_user_id and user_id == exclude_user_id:
                continue
            await self.send_to_user(user_id, message)

    def is_user_online(self, user_id: str) -> bool:
        return user_id in self.active_connections

    def get_online_count(self) -> int:
        return len(self.active_connections)
connection_manager = ConnectionManager()