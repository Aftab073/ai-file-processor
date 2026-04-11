from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, HTTPException
from app.utils.file_handlers import save_temp_file, cleanup_old_files
from app.services.audio_service import transcribe_audio
import time
import os

router = APIRouter()

@router.post("/transcribe")
async def process_audio(
    background_tasks: BackgroundTasks,
    language: str = Form("Auto"), 
    file: UploadFile = File(...)
):
    start_time = time.time()
    
    # 1. Save uploaded file temporarily
    file_path = save_temp_file(file)
    
    # 2. Schedule cleanup function (assuming cleanup_old_files deletes old temp_uploads)
    background_tasks.add_task(cleanup_old_files, max_age_minutes=60)
    
    # 3. Transcribe using Groq
    result = transcribe_audio(file_path, language)
    
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result.get("message", "Failed to transcribe audio"))
        
    duration = round(time.time() - start_time, 2)
    
    # Generate duration text smartly
    duration_text = f"Generated in {duration}s"
    if duration > 60:
        mins = int(duration // 60)
        secs = int(duration % 60)
        duration_text = f"Generated in {mins}m {secs}s"
        
    return {
        "status": "success",
        "text": result["text"],
        "duration": duration_text
    }
