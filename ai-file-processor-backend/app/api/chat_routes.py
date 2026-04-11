from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, HTTPException
from app.utils.file_handlers import save_temp_file, cleanup_old_files
from app.services.document_service import extract_text_from_pdf, chat_with_document
import os

router = APIRouter()

# In-memory "database" to hold document text. 
# For an MVP, mapping filename to extracted text prevents re-extracting the PDF on every single chat message.
document_cache = {}

@router.post("/query")
async def process_chat_query(
    background_tasks: BackgroundTasks,
    question: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        cache_key = file.filename
        
        # 1. Fetch from Cache or Extract Text
        if cache_key in document_cache:
            document_text = document_cache[cache_key]
        else:
            file_path = save_temp_file(file)
            background_tasks.add_task(cleanup_old_files, max_age_minutes=60)
            
            document_text = extract_text_from_pdf(file_path)
            
            if not document_text.strip():
                raise HTTPException(status_code=400, detail="Could not extract any readable text from this PDF.")
                
            document_cache[cache_key] = document_text

        # 2. Hit Groq Llama with Document Context
        result = chat_with_document(document_text, question)
        
        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result["message"])
            
        return {
            "status": "success",
            "answer": result["answer"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
