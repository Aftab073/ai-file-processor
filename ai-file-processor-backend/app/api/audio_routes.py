from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, HTTPException
from pydantic import BaseModel
from app.utils.file_handlers import save_temp_file, cleanup_old_files
from app.services.audio_service import transcribe_audio, summarize_transcript, download_audio_from_url
import time
import os

router = APIRouter()


def _format_duration(seconds: float) -> str:
    """Formats processing duration into a human-readable string."""
    if seconds > 60:
        mins = int(seconds // 60)
        secs = int(seconds % 60)
        return f"Generated in {mins}m {secs}s"
    return f"Generated in {round(seconds, 2)}s"


@router.post("/transcribe")
async def process_audio(
    background_tasks: BackgroundTasks,
    language: str = Form("Auto"), 
    file: UploadFile = File(...)
):
    start_time = time.time()
    
    # 1. Save uploaded file temporarily
    file_path = save_temp_file(file)
    
    # 2. Schedule cleanup function
    background_tasks.add_task(cleanup_old_files, max_age_minutes=60)
    
    # 3. Transcribe using Groq Whisper
    result = transcribe_audio(file_path, language)
    
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result.get("message", "Failed to transcribe audio"))
    
    # 4. Calculate word count
    word_count = len(result["text"].split())
    
    duration = round(time.time() - start_time, 2)
        
    return {
        "status": "success",
        "text": result["text"],
        "word_count": word_count,
        "duration": _format_duration(duration)
    }


# --- URL Transcription ---

class TranscribeURLRequest(BaseModel):
    url: str
    language: str = "Auto"


@router.post("/transcribe-url")
async def process_audio_url(
    request: TranscribeURLRequest,
    background_tasks: BackgroundTasks,
):
    start_time = time.time()
    
    # 1. Download audio from the URL using yt-dlp
    download_result = download_audio_from_url(request.url)
    
    if download_result["status"] == "error":
        raise HTTPException(status_code=400, detail=download_result["message"])
    
    file_path = download_result["file_path"]
    video_title = download_result.get("title", "Unknown")
    
    # 2. Schedule cleanup
    background_tasks.add_task(cleanup_old_files, max_age_minutes=60)
    
    # 3. Transcribe
    result = transcribe_audio(file_path, request.language)
    
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result.get("message", "Failed to transcribe audio"))
    
    # 4. Word count
    word_count = len(result["text"].split())
    
    duration = round(time.time() - start_time, 2)
    
    # 5. Cleanup the downloaded file immediately
    try:
        os.remove(file_path)
    except Exception:
        pass
    
    return {
        "status": "success",
        "text": result["text"],
        "word_count": word_count,
        "video_title": video_title,
        "duration": _format_duration(duration)
    }


# --- On-Demand AI Summary ---

class SummarizeRequest(BaseModel):
    text: str


@router.post("/summarize")
async def generate_summary(request: SummarizeRequest):
    """User explicitly requests an AI summary of their transcript."""
    summary = summarize_transcript(request.text)
    return {
        "status": "success",
        "summary": summary,
    }
