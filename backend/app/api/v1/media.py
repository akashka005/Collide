import os
import time
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse

router = APIRouter(prefix="/media", tags=["Media"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads", "voice_notes")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/voice-note")
async def upload_voice_note(file: UploadFile = File(...)):
    filename = file.filename or "recording.webm"
    ext = os.path.splitext(filename)[1] or ".webm"
    safe_name = f"voice-{uuid.uuid4().hex[:12]}{ext}"
    dest_path = os.path.join(UPLOAD_DIR, safe_name)

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Voice note too large. Maximum size is 5MB.")

    with open(dest_path, "wb") as f:
        f.write(content)

    return {
        "audioUrl": f"/api/v1/media/voice-note/{safe_name}",
        "sizeBytes": len(content),
    }


@router.get("/voice-note/{filename}")
async def get_voice_note(filename: str):
    file_path = os.path.join(UPLOAD_DIR, os.path.basename(filename))
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    return FileResponse(file_path, media_type="audio/webm")
