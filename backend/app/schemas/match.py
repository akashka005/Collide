from typing import List, Literal, Optional
from pydantic import BaseModel, Field

ChatMode = Literal["text", "video"]
MatchAlgorithm = Literal["smart", "random"]
MatchStatus = Literal["idle", "searching", "connected", "ended"]
class MatchPartner(BaseModel):
    id: str
    pseudonym: str
    avatarUrl: str
    interests: List[str] = Field(default_factory=list)
    language: str = "en"
    country: str = "Earth"
    mode: ChatMode
    matchScore: int
    sharedInterests: List[str] = Field(default_factory=list)


class QueueJoinRequest(BaseModel):
    mode: ChatMode = "video"
    algorithm: MatchAlgorithm = "smart"
    interests: List[str] = Field(default_factory=list)
    language: str = "en"
    country: Optional[str] = "Earth"


class QueueStatusResponse(BaseModel):
    status: MatchStatus
    roomId: Optional[str] = None
    partner: Optional[MatchPartner] = None
    queueDepth: int = 0
