import time
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.db.models import User
from app.schemas.user import UserProfile, UserProfileUpdate
from app.core.security import generate_session_id

router = APIRouter(prefix="/sessions", tags=["Sessions"])


@router.post("", response_model=UserProfile)
async def create_session(db: AsyncSession = Depends(get_db)):
    user_id = generate_session_id("usr")
    pseudonym = f"Wanderer{int(time.time() % 10000):04d}"

    user = User(
        id=user_id,
        name=pseudonym,
        pseudonym=pseudonym,
        avatarUrl="/assets/landing/avatar-3.webp",
        provider="guest",
        age_verified=True,
        interests=["Tech & AI", "Gaming", "Music & Bands", "Late Night Chill"],
        language="en",
        country="Earth",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return UserProfile(
        id=user.id,
        pseudonym=user.pseudonym,
        avatarUrl=user.avatar_url,
        ageVerified=user.age_verified,
        interests=user.interests or [],
        language=user.language,
        country=user.country,
        provider="guest",
    )


@router.get("/{session_id}", response_model=UserProfile)
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.id == session_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Session not found")

    return UserProfile(
        id=user.id,
        pseudonym=user.pseudonym,
        avatarUrl=user.avatar_url,
        ageVerified=user.age_verified,
        interests=user.interests or [],
        language=user.language,
        country=user.country,
        email=user.email,
        provider=user.provider,
    )


@router.patch("/{session_id}", response_model=UserProfile)
async def update_session(session_id: str, updates: UserProfileUpdate, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.id == session_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Session not found")

    if updates.pseudonym is not None:
        user.pseudonym = updates.pseudonym.strip()
        user.name = updates.pseudonym.strip()
    if updates.avatarUrl is not None:
        user.avatar_url = updates.avatarUrl
    if updates.interests is not None:
        user.interests = updates.interests
    if updates.language is not None:
        user.language = updates.language
    if updates.country is not None:
        user.country = updates.country
    if updates.bio is not None:
        user.bio = updates.bio

    await db.commit()
    await db.refresh(user)

    return UserProfile(
        id=user.id,
        pseudonym=user.pseudonym,
        avatarUrl=user.avatar_url,
        ageVerified=user.age_verified,
        interests=user.interests or [],
        language=user.language,
        country=user.country,
        email=user.email,
        provider=user.provider,
    )

