import os
import uuid
import shutil
import time
from fastapi import UploadFile

# Use absolute path to ensure we always write to the correct folder
UPLOAD_DIR = os.path.abspath("temp_uploads")

# Ensure the directory exists when this file is loaded
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_temp_file(upload_file: UploadFile) -> str:
    """Saves an uploaded file with a unique name to prevent overwriting."""
    # 1. Get the original file extension (e.g., .pdf, .png)
    _, ext = os.path.splitext(upload_file.filename)
    
    # 2. Generate a random unique ID for the file
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # 3. Save the file to our hard drive safely
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
        
    return file_path

def cleanup_old_files(max_age_minutes: int = 60):
    """Deletes files in the temp directory older than the specified minutes."""
    now = time.time()
    for filename in os.listdir(UPLOAD_DIR):
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        # Check if it's a file (not a folder)
        if os.path.isfile(file_path):
            # Get the time the file was last modified
            file_modified_time = os.path.getmtime(file_path)
            age_in_minutes = (now - file_modified_time) / 60
            
            if age_in_minutes > max_age_minutes:
                os.remove(file_path)
                print(f"Deleted old temporary file: {filename}")