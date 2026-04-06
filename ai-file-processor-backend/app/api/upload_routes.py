from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks
from app.utils.file_handlers import save_temp_file, cleanup_old_files
import os

router = APIRouter()

@router.post("/process-file")
async def process_file(
    background_tasks: BackgroundTasks,
    prompt: str = Form(...), 
    file: UploadFile = File(...)
):
    """
    Accepts a file and a user prompt.
    Saves the file temporarily and schedules a cleanup task.
    """
    # 1. Save the file and get the path
    file_path = save_temp_file(file)
    
    # 2. Get the file size for reference (optional but helpful)
    file_size_bytes = os.path.getsize(file_path)
    file_size_mb = round(file_size_bytes / (1024 * 1024), 2)
    
    # 3. Schedule the cleanup task to run AFTER this response is sent
    background_tasks.add_task(cleanup_old_files, max_age_minutes=60)
    
    # 4. Return success (In Phase 3, we will pass this to the AI instead)
    return {
        "status": "success",
        "message": "File uploaded successfully.",
        "user_prompt": prompt,
        "file_details": {
            "original_name": file.filename,
            "saved_path": file_path,
            "size_mb": file_size_mb
        }
    }