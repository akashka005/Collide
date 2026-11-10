from typing import Optional
import redis.asyncio as aioredis
from app.core.config import settings
from app.core.logging import logger

_redis_client: Optional[aioredis.Redis] = None


async def get_redis() -> aioredis.Redis:
    global _redis_client
    if _redis_client is not None:
        return _redis_client

    if settings.USE_FAKE_REDIS:
        try:
            import fakeredis.aioredis
            _redis_client = fakeredis.aioredis.FakeRedis(decode_responses=True)
            logger.info("Initialized in-memory FakeRedis for local development/testing.")
            return _redis_client
        except Exception as e:
            logger.warning(f"Could not initialize fakeredis ({e}), falling back to real Redis connection.")

    try:
        _redis_client = aioredis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            socket_timeout=5,
            socket_connect_timeout=5
        )
        await _redis_client.ping()
        logger.info(f"Connected to Redis at {settings.REDIS_URL}")
    except Exception as e:
        logger.warning(f"Failed to connect to Redis at {settings.REDIS_URL}: {e}. Falling back to FakeRedis.")
        import fakeredis.aioredis
        _redis_client = fakeredis.aioredis.FakeRedis(decode_responses=True)

    return _redis_client


async def reset_redis():
    global _redis_client
    if _redis_client is not None:
        try:
            if hasattr(_redis_client, "aclose"):
                await _redis_client.aclose()
            else:
                await _redis_client.close()
        except Exception:
            pass
        _redis_client = None


async def close_redis():
    await reset_redis()

