from typing import Any, Dict, Optional
from pydantic import BaseModel, Field
import time
class WebSocketEnvelope(BaseModel):
    event: str
    sessionId: Optional[str] = None
    payload: Dict[str, Any] = Field(default_factory=dict)
    timestamp: int = Field(default_factory=lambda: int(time.time() * 1000))
class RTCSdpPayload(BaseModel):
    sdp: str
    type: str
class RTCIceCandidatePayload(BaseModel):
    candidate: str
    sdpMid: Optional[str] = None
    sdpMLineIndex: Optional[int] = None