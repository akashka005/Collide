import time
from typing import Dict, Any
from app.realtime.connection_manager import connection_manager
from app.realtime.games_handler import games_handler
from app.services.matching_service import matching_service
from app.services.room_service import room_service
from app.schemas.user import UserProfile
from app.schemas.match import MatchPartner
from app.core.logging import logger


class EventRouter:
    async def dispatch(self, user_id: str, data: Dict[str, Any]):
        event = data.get("event")
        payload = data.get("payload", {})
        logger.info(f"Dispatching event '{event}' from user {user_id}")

        if event == "queue.join":
            await self._handle_queue_join(user_id, payload)
        elif event == "queue.cancel":
            await self._handle_queue_cancel(user_id)
        elif event == "chat.message":
            await self._handle_chat_message(user_id, payload)
        elif event == "chat.typing":
            await self._handle_chat_typing(user_id, payload)
        elif event == "chat.reaction":
            await self._handle_chat_reaction(user_id, payload)
        elif event == "game.start":
            await self._handle_game_start(user_id, payload)
        elif event == "game.tictactoe.move":
            await self._handle_tictactoe_move(user_id, payload)
        elif event == "game.tictactoe.reset":
            await self._handle_tictactoe_reset(user_id)
        elif event == "game.trivia.answer":
            await self._handle_trivia_answer(user_id, payload)
        elif event == "game.wyr.vote":
            await self._handle_wyr_vote(user_id, payload)
        elif event == "connection.request":
            await self._handle_connection_request(user_id)
        elif event == "connection.accept":
            await self._handle_connection_accept(user_id)
        elif event in ("webrtc.offer", "webrtc.answer", "webrtc.ice_candidate"):
            await self._handle_webrtc_signaling(user_id, event, payload)
        elif event == "match.skip":
            await self._handle_match_skip(user_id, payload)
        elif event == "match.disconnect":
            await self._handle_match_disconnect(user_id)
        else:
            logger.warning(f"Unhandled WebSocket event: {event}")

    async def _handle_queue_join(self, user_id: str, payload: Dict[str, Any]):
        # Enforce age verification gate — client must pass ageVerified: true
        age_verified = payload.get("ageVerified", False)
        if not age_verified:
            await connection_manager.send_to_user(user_id, {
                "event": "queue.error",
                "payload": {"reason": "age_verification_required"},
                "timestamp": int(time.time() * 1000),
            })
            logger.warning(f"Queue join rejected for user {user_id}: age not verified.")
            return

        mode = payload.get("mode", "video")
        algorithm = payload.get("algorithm", "smart")
        profile_data = payload.get("profile", {})

        profile = UserProfile(
            id=user_id,
            pseudonym=profile_data.get("pseudonym", "Stranger"),
            avatarUrl=profile_data.get("avatarUrl", "/assets/landing/avatar-1.webp"),
            interests=profile_data.get("interests", []),
            language=profile_data.get("language", "en"),
            country=profile_data.get("country", "Earth"),
        )

        room_id, partner = await matching_service.add_to_queue(profile, mode, algorithm)

        if room_id and partner:
            connection_manager.join_room(room_id, user_id)
            connection_manager.join_room(room_id, partner.id)
            await connection_manager.send_to_user(user_id, {
                "event": "match.found",
                "payload": {
                    "roomId": room_id,
                    "partner": partner.model_dump(),
                },
                "timestamp": int(time.time() * 1000)
            })
            user_partner_data = await room_service.get_partner_profile(partner.id)
            if user_partner_data:
                await connection_manager.send_to_user(partner.id, {
                    "event": "match.found",
                    "payload": {
                        "roomId": room_id,
                        "partner": user_partner_data,
                    },
                    "timestamp": int(time.time() * 1000)
                })
        else:
            queue_depth = await matching_service.get_queue_depth(mode)
            await connection_manager.send_to_user(user_id, {
                "event": "queue.joined",
                "payload": {
                    "status": "searching",
                    "queueDepth": queue_depth,
                },
                "timestamp": int(time.time() * 1000)
            })

    async def _handle_queue_cancel(self, user_id: str):
        await matching_service.remove_from_queue(user_id)
        await connection_manager.send_to_user(user_id, {
            "event": "queue.cancelled",
            "payload": {"status": "idle"},
            "timestamp": int(time.time() * 1000)
        })

    async def _handle_chat_message(self, user_id: str, payload: Dict[str, Any]):
        room_id = await room_service.get_user_room_id(user_id)
        if not room_id:
            return

        msg_id = payload.get("id") or f"msg-{int(time.time() * 1000)}"
        message_envelope = {
            "event": "chat.message",
            "payload": {
                "id": msg_id,
                "senderId": user_id,
                "senderName": payload.get("senderName", "Stranger"),
                "text": payload.get("text", ""),
                "audioUrl": payload.get("audioUrl"),
                "audioDuration": payload.get("audioDuration"),
                "timestamp": int(time.time() * 1000),
            },
            "timestamp": int(time.time() * 1000)
        }
        await connection_manager.broadcast_to_room(room_id, message_envelope, exclude_user_id=user_id)

    async def _handle_chat_typing(self, user_id: str, payload: Dict[str, Any]):
        room_id = await room_service.get_user_room_id(user_id)
        if room_id:
            await connection_manager.broadcast_to_room(
                room_id,
                {
                    "event": "chat.typing",
                    "payload": {
                        "userId": user_id,
                        "isTyping": payload.get("isTyping", False),
                    },
                    "timestamp": int(time.time() * 1000)
                },
                exclude_user_id=user_id
            )

    async def _handle_chat_reaction(self, user_id: str, payload: Dict[str, Any]):
        room_id = await room_service.get_user_room_id(user_id)
        if room_id:
            await connection_manager.broadcast_to_room(
                room_id,
                {
                    "event": "chat.reaction",
                    "payload": {
                        "userId": user_id,
                        "emojiName": payload.get("emojiName", "sparkles"),
                    },
                    "timestamp": int(time.time() * 1000)
                },
                exclude_user_id=user_id
            )

    async def _handle_game_start(self, user_id: str, payload: Dict[str, Any]):
        room_id = await room_service.get_user_room_id(user_id)
        if not room_id:
            return
        game_type = payload.get("game")
        state = await games_handler.init_game(room_id, game_type, user_id)
        await connection_manager.broadcast_to_room(
            room_id,
            {
                "event": "game.start",
                "payload": {
                    "game": game_type,
                    "state": state,
                },
                "timestamp": int(time.time() * 1000)
            }
        )

    async def _handle_tictactoe_move(self, user_id: str, payload: Dict[str, Any]):
        room_id = await room_service.get_user_room_id(user_id)
        if not room_id:
            return
        cell_index = payload.get("cellIndex", 0)
        symbol = payload.get("symbol", "X")
        new_state = await games_handler.handle_tictactoe_move(room_id, user_id, cell_index, symbol)
        if new_state:
            await connection_manager.broadcast_to_room(
                room_id,
                {
                    "event": "game.tictactoe.sync",
                    "payload": new_state,
                    "timestamp": int(time.time() * 1000)
                }
            )

    async def _handle_tictactoe_reset(self, user_id: str):
        room_id = await room_service.get_user_room_id(user_id)
        if not room_id:
            return
        new_state = await games_handler.reset_tictactoe(room_id)
        if new_state:
            await connection_manager.broadcast_to_room(
                room_id,
                {
                    "event": "game.tictactoe.sync",
                    "payload": new_state,
                    "timestamp": int(time.time() * 1000)
                }
            )

    async def _handle_trivia_answer(self, user_id: str, payload: Dict[str, Any]):
        room_id = await room_service.get_user_room_id(user_id)
        if not room_id:
            return
        await connection_manager.broadcast_to_room(
            room_id,
            {
                "event": "game.trivia.answer",
                "payload": {
                    "userId": user_id,
                    "optionIndex": payload.get("optionIndex"),
                    "questionId": payload.get("questionId"),
                },
                "timestamp": int(time.time() * 1000)
            },
            exclude_user_id=user_id
        )

    async def _handle_wyr_vote(self, user_id: str, payload: Dict[str, Any]):
        room_id = await room_service.get_user_room_id(user_id)
        if not room_id:
            return
        await connection_manager.broadcast_to_room(
            room_id,
            {
                "event": "game.wyr.vote",
                "payload": {
                    "userId": user_id,
                    "choice": payload.get("choice"),
                },
                "timestamp": int(time.time() * 1000)
            },
            exclude_user_id=user_id
        )

    async def _handle_connection_request(self, user_id: str):
        room_id = await room_service.get_user_room_id(user_id)
        if not room_id:
            return
        partner_id = await room_service.get_partner_id(user_id, room_id)
        if partner_id:
            await connection_manager.send_to_user(partner_id, {
                "event": "connection.request",
                "payload": {"fromUserId": user_id},
                "timestamp": int(time.time() * 1000)
            })

    async def _handle_connection_accept(self, user_id: str):
        room_id = await room_service.get_user_room_id(user_id)
        if not room_id:
            return
        partner_id = await room_service.get_partner_id(user_id, room_id)
        if partner_id:
            await connection_manager.send_to_user(partner_id, {
                "event": "connection.accept",
                "payload": {"byUserId": user_id},
                "timestamp": int(time.time() * 1000)
            })

    async def _handle_webrtc_signaling(self, user_id: str, event: str, payload: Dict[str, Any]):
        room_id = await room_service.get_user_room_id(user_id)
        if not room_id:
            return
        partner_id = await room_service.get_partner_id(user_id, room_id)
        if partner_id:
            await connection_manager.send_to_user(partner_id, {
                "event": event,
                "payload": payload,
                "timestamp": int(time.time() * 1000)
            })

    async def _handle_match_skip(self, user_id: str, payload: Dict[str, Any]):
        room_id = await room_service.get_user_room_id(user_id)
        if room_id:
            partner_id = await room_service.get_partner_id(user_id, room_id)
            await room_service.close_room(room_id)
            if partner_id:
                await connection_manager.send_to_user(partner_id, {
                    "event": "match.ended",
                    "payload": {"reason": "partner_skipped"},
                    "timestamp": int(time.time() * 1000)
                })
        if payload.get("requeue", True):
            await self._handle_queue_join(user_id, payload)

    async def _handle_match_disconnect(self, user_id: str):
        room_id = await room_service.get_user_room_id(user_id)
        if room_id:
            partner_id = await room_service.get_partner_id(user_id, room_id)
            await room_service.close_room(room_id)
            if partner_id:
                await connection_manager.send_to_user(partner_id, {
                    "event": "match.ended",
                    "payload": {"reason": "partner_disconnected"},
                    "timestamp": int(time.time() * 1000)
                })
event_router = EventRouter()