import time
from sqlalchemy import (
    Column,
    String,
    Boolean,
    BigInteger,
    Text,
    JSON,
    Index,
)
from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    email = Column(String(128), unique=True, nullable=True, index=True)
    hashed_password = Column(String(256), nullable=True)
    name = Column(String(64), nullable=False)
    avatar_url = Column(String(256), nullable=False, default="/assets/landing/avatar-1.webp")
    provider = Column(String(16), nullable=False, default="guest")  # google, email, guest
    pseudonym = Column(String(64), nullable=False)
    age_verified = Column(Boolean, default=True)
    interests = Column(JSON, default=list)
    language = Column(String(8), default="en")
    country = Column(String(64), default="Earth")
    bio = Column(String(256), nullable=True)
    is_banned = Column(Boolean, default=False)
    created_at = Column(BigInteger, default=lambda: int(time.time() * 1000))


class MutualConnection(Base):
    __tablename__ = "mutual_connections"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), index=True, nullable=False)
    partner_id = Column(String(64), index=True, nullable=False)
    partner_name = Column(String(64), nullable=False)
    partner_avatar = Column(String(256), nullable=False)
    partner_country = Column(String(64), default="Earth")
    shared_interests = Column(JSON, default=list)
    connected_at = Column(BigInteger, default=lambda: int(time.time() * 1000))

    __table_args__ = (
        Index("idx_user_partner", "user_id", "partner_id", unique=True),
    )


class SafetyReport(Base):
    __tablename__ = "safety_reports"

    id = Column(String(64), primary_key=True, index=True)
    reported_user_id = Column(String(64), index=True, nullable=False)
    reported_user_name = Column(String(64), nullable=False)
    reporter_id = Column(String(64), index=True, nullable=False)
    category = Column(String(32), nullable=False)
    notes = Column(Text, default="")
    status = Column(String(16), default="pending")
    created_at = Column(BigInteger, default=lambda: int(time.time() * 1000))


class UserBlock(Base):
    __tablename__ = "user_blocks"

    id = Column(String(64), primary_key=True, index=True)
    blocker_id = Column(String(64), index=True, nullable=False)
    blocked_user_id = Column(String(64), index=True, nullable=False)
    blocked_user_name = Column(String(64), nullable=False)
    reason = Column(String(256), default="Blocked by user")
    created_at = Column(BigInteger, default=lambda: int(time.time() * 1000))

    __table_args__ = (
        Index("idx_blocker_blocked", "blocker_id", "blocked_user_id", unique=True),
    )