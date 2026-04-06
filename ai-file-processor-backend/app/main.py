from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI File Processing API",
    description="Backend for AI-driven file operations",
    version="1.0.0"
)

# Set up CORS (Cross-Origin Resource Sharing)
# This is crucial so your React frontend can talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, change "*" to your React app's URL (e.g., "http://localhost:3000")
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "AI File Processing API is running smoothly. 🚀"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}