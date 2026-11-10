import json
import time
import uuid
from typing import List, Optional, Tuple, Dict, Any
from app.services.redis_client import get_redis
from app.schemas.match import MatchPartner, ChatMode, MatchAlgorithm
from app.schemas.user import UserProfile


def calculate_compatibility(
    user_interests: List[str],
    peer_interests: List[str],
    user_lang: Optional[str] = None,
    peer_lang: Optional[str] = None,
) -> Tuple[int, List[str]]:
    """
    Matches the frontend calculateCompatibilityScore algorithm:
    Interest Jaccard overlap + bonus for matching language preference.
    """
    same_lang = bool(
        user_lang
        and peer_lang
        and user_lang != "any"
        and peer_lang != "any"
        and user_lang.lower() == peer_lang.lower()
    )

    baseline = 60 if same_lang else 45

    if not user_interests or not peer_interests:
        return (80 if same_lang else 65), []

    set_a = set(t.lower() for t in user_interests)
    shared = [t for t in peer_interests if t.lower() in set_a]

    union_count = len(set(user_interests + peer_interests))
    jaccard = len(shared) / union_count if union_count > 0 else 0.0

    calculated = int(baseline + jaccard * 35 + (8 if len(shared) > 0 else 0))
    score = min(99, max(50, calculated))
    return score, shared


class MatchingService:
    ALL_LANGUAGES = ["any", "en", "es", "fr", "de", "ja", "pt", "it", "hi", "zh", "ar", "ko", "ru"]

    def __init__(self):
        pass

    def _queue_key(self, mode: str, language: str) -> str:
        lang = language.lower() if language else "any"
        return f"queue:{mode}:{lang}"

    async def add_to_queue(
        self,
        user_profile: UserProfile,
        mode: ChatMode,
        algorithm: MatchAlgorithm,
    ) -> Tuple[Optional[str], Optional[MatchPartner], Optional[MatchPartner]]:
        redis = await get_redis()
        user_id = user_profile.id
        await self.remove_from_queue(user_id)
        blocked_set = await redis.smembers(f"blocked:{user_id}")
        recent_partners = await redis.lrange(f"recent:{user_id}", 0, 1)
        user_lang = (user_profile.language or "any").lower()
        if user_lang != "any":
            queue_keys = [self._queue_key(mode, user_lang), self._queue_key(mode, "any")]
        else:
            queue_keys = [self._queue_key(mode, l) for l in self.ALL_LANGUAGES]

        best_candidate: Optional[Dict[str, Any]] = None
        best_candidate_key: Optional[str] = None
        best_score = -1
        best_shared = []

        for q_key in queue_keys:
            waiting_tickets = await redis.hgetall(q_key)
            for peer_id, ticket_json in waiting_tickets.items():
                if peer_id == user_id:
                    continue
                if peer_id in blocked_set or peer_id in recent_partners:
                    continue
                peer_blocks = await redis.smembers(f"blocked:{peer_id}")
                if user_id in peer_blocks:
                    continue

                ticket = json.loads(ticket_json)
                peer_interests = ticket.get("interests", [])
                peer_lang = ticket.get("language", "any")

                score, shared = calculate_compatibility(
                    user_profile.interests,
                    peer_interests,
                    user_lang,
                    peer_lang,
                )

                if algorithm == "random":
                    best_candidate = ticket
                    best_candidate_key = q_key
                    best_score = score
                    best_shared = shared
                    break

                if score > best_score:
                    best_score = score
                    best_shared = shared
                    best_candidate = ticket
                    best_candidate_key = q_key

            if best_candidate and algorithm == "random":
                break
        if best_candidate and best_candidate_key:
            peer_id = best_candidate["id"]
            deleted = await redis.hdel(best_candidate_key, peer_id)
            if deleted:
                room_id = f"room-{uuid.uuid4().hex[:12]}"
                room_data = {
                    "roomId": room_id,
                    "mode": mode,
                    "createdAt": int(time.time() * 1000),
                    "users": [user_id, peer_id],
                    "status": "connected",
                }
                await redis.set(f"room:{room_id}", json.dumps(room_data), ex=3600)
                await redis.set(f"user_room:{user_id}", room_id, ex=3600)
                await redis.set(f"user_room:{peer_id}", room_id, ex=3600)
                peer_partner_for_user = MatchPartner(
                    id=peer_id,
                    pseudonym=best_candidate["pseudonym"],
                    avatarUrl=best_candidate["avatarUrl"],
                    interests=best_candidate.get("interests", []),
                    language=best_candidate.get("language", "en"),
                    country=best_candidate.get("country", "Earth"),
                    mode=mode,
                    matchScore=best_score,
                    sharedInterests=best_shared,
                )
                user_partner_for_peer = MatchPartner(
                    id=user_id,
                    pseudonym=user_profile.pseudonym,
                    avatarUrl=user_profile.avatarUrl,
                    interests=user_profile.interests,
                    language=user_profile.language,
                    country=user_profile.country,
                    mode=mode,
                    matchScore=best_score,
                    sharedInterests=best_shared,
                )

                await redis.set(f"partner:{user_id}", peer_partner_for_user.model_dump_json(), ex=3600)
                await redis.set(f"partner:{peer_id}", user_partner_for_peer.model_dump_json(), ex=3600)
                await redis.lpush(f"recent:{user_id}", peer_id)
                await redis.ltrim(f"recent:{user_id}", 0, 1)
                await redis.lpush(f"recent:{peer_id}", user_id)
                await redis.ltrim(f"recent:{peer_id}", 0, 1)

                return room_id, peer_partner_for_user, user_partner_for_peer
        ticket_payload = {
            "id": user_id,
            "pseudonym": user_profile.pseudonym,
            "avatarUrl": user_profile.avatarUrl,
            "interests": user_profile.interests,
            "language": user_profile.language or "any",
            "country": user_profile.country or "Earth",
            "mode": mode,
            "algorithm": algorithm,
            "enqueuedAt": int(time.time() * 1000),
        }
        my_queue_key = self._queue_key(mode, user_lang)
        await redis.hset(my_queue_key, user_id, json.dumps(ticket_payload))
        await redis.set(f"user_waiting_queue:{user_id}", my_queue_key, ex=300)

        return None, None, None

    async def remove_from_queue(self, user_id: str):
        redis = await get_redis()
        queue_key = await redis.get(f"user_waiting_queue:{user_id}")
        if queue_key:
            await redis.hdel(queue_key, user_id)
            await redis.delete(f"user_waiting_queue:{user_id}")

    async def get_queue_depth(self, mode: Optional[str] = None) -> int:
        redis = await get_redis()
        total = 0
        modes = [mode] if mode else ["video", "text"]
        for m in modes:
            for lang in self.ALL_LANGUAGES:
                k = self._queue_key(m, lang)
                total += await redis.hlen(k)
        return total


matching_service = MatchingService()