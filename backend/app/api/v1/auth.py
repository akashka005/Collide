import time
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.db.models import User
from app.schemas.user import (
    GuestLoginRequest,
    GoogleLoginRequest,
    EmailLoginRequest,
    EmailSignupRequest,
    AuthResponse,
    AuthUser,
    UserProfile,
)
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
    generate_session_id,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/guest", response_model=AuthResponse)
async def login_as_guest(req: GuestLoginRequest, db: AsyncSession = Depends(get_db)):
    user_id = generate_session_id("guest")
    name = req.name.strip() if req.name and req.name.strip() else f"Guest{int(time.time() % 10000):04d}"
    avatar_url = req.avatarUrl or "/assets/landing/avatar-3.webp"

    user = User(
        id=user_id,
        name=name,
        pseudonym=name,
        avatar_url=avatar_url,
        provider="guest",
        age_verified=True,
        interests=["Tech & AI", "Gaming", "Music & Bands", "Late Night Chill"],
        language="en",
        country="Earth",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": user.id, "provider": "guest"})

    auth_user = AuthUser(
        id=user.id,
        name=user.name,
        avatarUrl=user.avatar_url,
        provider="guest",
        createdAt=user.created_at,
    )
    profile = UserProfile(
        id=user.id,
        pseudonym=user.pseudonym,
        avatarUrl=user.avatar_url,
        ageVerified=user.age_verified,
        interests=user.interests or [],
        language=user.language,
        country=user.country,
        provider="guest",
    )
    return AuthResponse(user=auth_user, profile=profile, token=token)


@router.post("/google", response_model=AuthResponse)
async def login_with_google(req: GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    email = req.email.strip() if req.email else "akashka688@gmail.com"
    name = req.name.strip() if req.name else "Akash K."
    avatar_url = req.avatarUrl or "/assets/landing/avatar-1.webp"
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        user_id = generate_session_id("google")
        user = User(
            id=user_id,
            email=email,
            name=name,
            pseudonym=name,
            avatar_url=avatar_url,
            provider="google",
            age_verified=True,
            interests=["Tech & AI", "Gaming", "Music & Bands", "Late Night Chill"],
            language="en",
            country="Earth",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    token = create_access_token({"sub": user.id, "email": user.email, "provider": "google"})

    auth_user = AuthUser(
        id=user.id,
        name=user.name,
        email=user.email,
        avatarUrl=user.avatar_url,
        provider="google",
        createdAt=user.created_at,
    )
    profile = UserProfile(
        id=user.id,
        pseudonym=user.pseudonym,
        avatarUrl=user.avatar_url,
        ageVerified=user.age_verified,
        interests=user.interests or [],
        language=user.language,
        country=user.country,
        email=user.email,
        provider="google",
    )
    return AuthResponse(user=auth_user, profile=profile, token=token)


@router.post("/email/signup", response_model=AuthResponse)
async def signup_with_email(req: EmailSignupRequest, db: AsyncSession = Depends(get_db)):
    email = req.email.strip().lower()
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User with this email already exists.")

    user_id = generate_session_id("usr")
    name = req.name.strip() if req.name and req.name.strip() else email.split("@")[0]
    avatar_url = req.avatarUrl or "/assets/landing/avatar-2.webp"
    hashed_pwd = hash_password(req.password)

    user = User(
        id=user_id,
        email=email,
        hashed_password=hashed_pwd,
        name=name,
        pseudonym=name,
        avatar_url=avatar_url,
        provider="email",
        age_verified=True,
        interests=["Tech & AI", "Gaming", "Music & Bands"],
        language="en",
        country="Earth",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": user.id, "email": user.email, "provider": "email"})

    auth_user = AuthUser(
        id=user.id,
        name=user.name,
        email=user.email,
        avatarUrl=user.avatar_url,
        provider="email",
        createdAt=user.created_at,
    )
    profile = UserProfile(
        id=user.id,
        pseudonym=user.pseudonym,
        avatarUrl=user.avatar_url,
        ageVerified=user.age_verified,
        interests=user.interests or [],
        language=user.language,
        country=user.country,
        email=user.email,
        provider="email",
    )
    return AuthResponse(user=auth_user, profile=profile, token=token)


@router.post("/email/login", response_model=AuthResponse)
async def login_with_email(req: EmailLoginRequest, db: AsyncSession = Depends(get_db)):
    email = req.email.strip().lower()
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if req.password and not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token({"sub": user.id, "email": user.email, "provider": user.provider})

    auth_user = AuthUser(
        id=user.id,
        name=user.name,
        email=user.email,
        avatarUrl=user.avatar_url,
        provider=user.provider,
        createdAt=user.created_at,
    )
    profile = UserProfile(
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
    return AuthResponse(user=auth_user, profile=profile, token=token)


@router.get("/me", response_model=UserProfile)
async def get_current_user(
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header.")

    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid token.")

    user_id = payload["sub"]
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

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