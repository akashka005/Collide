from typing import Optional
from pydantic import BaseModel
class ChatMessage(BaseModel):
    id: str
    senderId: str
    senderName: str
    text: str
    timestamp: int
    isSystem: Optional[bool] = False
    audioUrl: Optional[str] = None
    audioDuration: Optional[int] = None
class SendMessageRequest(BaseModel):
    text: str
    audioUrl: Optional[str] = None
    audioDuration: Optional[int] = None
class EmojiReactionPayload(BaseModel):
    emojiName: str