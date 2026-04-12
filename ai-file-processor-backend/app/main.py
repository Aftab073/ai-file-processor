from fastapi import FastAPI
import os
from fastapi.middleware.cors import CORSMiddleware
from app.api import upload_routes, download_routes, audio_routes, chat_routes
app = FastAPI(
    title="AI File Processing API",
    description="Backend for AI-driven file operations",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        os.getenv("FRONTEND_URL", "https://documind0.vercel.app")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_routes.router, prefix="/api", tags=["File Processing"])
app.include_router(download_routes.router, prefix="/api", tags=["File Download"])
app.include_router(audio_routes.router, prefix="/api", tags=["Audio Transcription"])
app.include_router(chat_routes.router, prefix="/api/chat", tags=["Chat with Document"])

@app.get("/")
async def root():
    return {"message": "AI File Processing API is running smoothly. 🚀"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}