from typing import Optional, List, Literal
from pydantic import BaseModel, Field

AuthProviderType = Literal["google", "email", "guest"]
class AuthUser(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    avatarUrl: str
    provider: AuthProviderType
    createdAt: int


class UserProfile(BaseModel):
    id: str
    pseudonym: str
    avatarUrl: str
    ageVerified: bool = True
    interests: List[str] = Field(default_factory=list)
    language: str = "en"
    country: str = "Earth"
    bio: Optional[str] = None
    email: Optional[str] = None
    provider: Optional[AuthProviderType] = "guest"


class UserProfileUpdate(BaseModel):
    pseudonym: Optional[str] = None
    avatarUrl: Optional[str] = None
    interests: Optional[List[str]] = None
    language: Optional[str] = None
    country: Optional[str] = None
    bio: Optional[str] = None


class GuestLoginRequest(BaseModel):
    name: Optional[str] = None
    avatarUrl: Optional[str] = None


class EmailLoginRequest(BaseModel):
    email: str
    password: Optional[str] = None


class EmailSignupRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = None
    avatarUrl: Optional[str] = None


class GoogleLoginRequest(BaseModel):
    email: Optional[str] = None
    name: Optional[str] = None
    avatarUrl: Optional[str] = None


class AuthResponse(BaseModel):
    user: AuthUser
    profile: UserProfile
    token: str