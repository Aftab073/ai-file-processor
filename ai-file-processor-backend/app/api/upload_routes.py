from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks
from app.utils.file_handlers import save_temp_file, cleanup_old_files
from app.services.ai_agent import analyze_prompt_intent
from app.services.file_tools import convert_image, compress_pdf 
import os

router = APIRouter()

@router.post("/process-file")
async def process_file(
    background_tasks: BackgroundTasks,
    prompt: str = Form(...), 
    file: UploadFile = File(...)
):
    # 1. Save original file
    file_path = save_temp_file(file)
    original_size_mb = round(os.path.getsize(file_path) / (1024 * 1024), 2)
    
    # 2. Schedule cleanup
    background_tasks.add_task(cleanup_old_files, max_age_minutes=60)
    
    # 3. Ask AI for Intent
    ai_intent = analyze_prompt_intent(prompt)
    
    # 4. EXECUTE THE TOOLS based on AI intent
    final_file_path = file_path
    processing_message = "No processing required or intent not recognized."
    
    # Handle different key names the AI might output (action vs intent)
    action = ai_intent.get("action") or ai_intent.get("intent")
    
    if action in ["convert", "convert_format"]:
        target_fmt = ai_intent.get("target_format")
        if target_fmt:
            final_file_path = convert_image(file_path, target_fmt)
            processing_message = f"Successfully converted to .{target_fmt}"
            
    elif action == "compress":
        target_kb = ai_intent.get("target_size_kb")
        if target_kb:
            result = compress_pdf(file_path, target_kb)
            final_file_path = result["path"]
            processing_message = result["message"]

    # 5. Get final size
    final_size_mb = round(os.path.getsize(final_file_path) / (1024 * 1024), 2)

    return {
        "status": "success",
        "processing_message": processing_message,
        "ai_analysis": ai_intent,
        "file_details": {
            "original_name": file.filename,
            "final_saved_path": final_file_path,
            "original_size_mb": original_size_mb,
            "final_size_mb": final_size_mb
        }
    }