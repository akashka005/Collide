from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.db.session import init_db
from app.services.redis_client import close_redis
from app.realtime.connection_manager import connection_manager
from app.realtime.event_router import event_router
from app.api.v1.health import router as health_router
from app.api.v1.auth import router as auth_router
from app.api.v1.sessions import router as sessions_router
from app.api.v1.matches import router as matches_router
from app.api.v1.reports import router as reports_router
from app.api.v1.blocks import router as blocks_router
from app.api.v1.connections import router as connections_router
from app.api.v1.moderation import router as moderation_router
from app.api.v1.webrtc import router as webrtc_router
from app.api.v1.media import router as media_router
from app.api.v1.copilot import router as copilot_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}...")
    await init_db()
    logger.info("Database initialized successfully.")
    yield
    logger.info("Shutting down STRAVAIR backend...")
    await close_redis()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
api_v1_prefix = "/api/v1"
app.include_router(health_router, prefix=api_v1_prefix)
app.include_router(auth_router, prefix=api_v1_prefix)
app.include_router(sessions_router, prefix=api_v1_prefix)
app.include_router(matches_router, prefix=api_v1_prefix)
app.include_router(reports_router, prefix=api_v1_prefix)
app.include_router(blocks_router, prefix=api_v1_prefix)
app.include_router(connections_router, prefix=api_v1_prefix)
app.include_router(moderation_router, prefix=api_v1_prefix)
app.include_router(webrtc_router, prefix=api_v1_prefix)
app.include_router(media_router, prefix=api_v1_prefix)
app.include_router(copilot_router, prefix=api_v1_prefix)
@app.get("/health", tags=["Health"])
async def root_health():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }

@app.websocket("/api/v1/realtime")
@app.websocket("/ws/realtime")
async def websocket_endpoint(
    websocket: WebSocket,
    userId: str = Query(..., alias="userId")
):
    await connection_manager.connect(userId, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            await event_router.dispatch(userId, data)
    except WebSocketDisconnect:
        connection_manager.disconnect(userId)
    except Exception as e:
        logger.error(f"WebSocket error for user {userId}: {e}")
        connection_manager.disconnect(userId)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)