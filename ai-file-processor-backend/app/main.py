from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import upload_routes, download_routes
app = FastAPI(
    title="AI File Processing API",
    description="Backend for AI-driven file operations",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_routes.router, prefix="/api", tags=["File Processing"])
app.include_router(download_routes.router, prefix="/api", tags=["File Download"])

@app.get("/")
async def root():
    return {"message": "AI File Processing API is running smoothly. 🚀"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}