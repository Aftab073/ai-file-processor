import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.utils.file_handlers import UPLOAD_DIR 
router = APIRouter()

@router.get("/download/{filename}")
async def download_file(filename: str):
    """
    Securely serves a processed file to the user.
    """
    # 1. SECURITY PRECAUTION: Prevent Path Traversal
    # We strip out any slash characters so users can't navigate outside the folder
    safe_filename = os.path.basename(filename) 
    file_path = os.path.join(UPLOAD_DIR, safe_filename)
    
    # 2. Check if the file actually exists
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found or has expired.")
    
    # 3. Return the file
    # filename=safe_filename forces the browser to download it with that name
    return FileResponse(
        path=file_path, 
        filename=safe_filename,
        media_type="application/octet-stream" # Tells the browser it's a generic file download
    )