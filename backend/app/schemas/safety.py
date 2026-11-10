from typing import List, Literal, Optional
from pydantic import BaseModel, Field

ReportCategory = Literal["harassment", "inappropriate", "spam", "underage", "other"]
ReportStatus = Literal["pending", "reviewed", "actioned", "dismissed"]
class SafetyReport(BaseModel):
    id: str
    reportedUserId: str
    reportedUserName: str
    reporterId: str
    category: ReportCategory
    notes: str
    timestamp: int
    status: ReportStatus = "pending"
class SafetyReportCreate(BaseModel):
    reportedUserId: str
    reportedUserName: str
    category: ReportCategory
    notes: Optional[str] = ""
class BlockRecord(BaseModel):
    blockedUserId: str
    blockedUserName: str
    timestamp: int
    reason: Optional[str] = None
class BlockCreate(BaseModel):
    blockedUserId: str
    blockedUserName: str
    reason: Optional[str] = "Blocked by user"
class MutualConnection(BaseModel):
    id: str
    partnerId: str
    partnerName: str
    partnerAvatar: str
    partnerCountry: str
    sharedInterests: List[str] = Field(default_factory=list)
    connectedAt: int
class ModerationMetrics(BaseModel):
    activeSessions: int
    queueDepth: int
    avgDurationSec: int
    reportRatePercent: float
    healthStatus: str