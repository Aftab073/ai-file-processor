<div align="center">
  <img src="./file_processor_frontend/public/logo.png" alt="DocuMind Logo" width="100"/>
  <h1>🚀 DocuMind AI</h1>
  <p><strong>A premium, animated AI workspace for intelligent file processing, audio transcription, and document fetching.</strong></p>
</div>

<br />

DocuMind is an enterprise-grade AI SaaS platform built natively with React and FastAPI. It replaces simple tools by intercepting Natural Language prompts. Don't have time to navigate complex UI sliders? Just drop a file and say `"Compress this PDF down to 2MB"` and DocuMind's logic processing engine takes care of the rest.

---

## ✨ Workspace Features

- ⚡ **AI File Processor:** Upload an image or PDF and provide a conversational prompt (e.g. *"Convert this to PNG and resize it to 800x600"*). The underlying API orchestrates the exact sequence of technical steps.
- 🎙️ **Audio Transcriber:** Drop heavy `MP3` or `WAV` voice notes/meetings, and output hyper-accurate text transcripts in seconds.
- 💬 **Chat with Document (RAG):** Upload massive, technical PDF files and leverage Groq's high-speed **Llama-3-70b-versatile** Engine to ask contextual questions about the document structure.
- 🪄 **Premium Interfaces:** Custom physics-driven UI loops and glowing Framer Motion animations engineered to provide an engaging, futuristic user experience.

---

## 🛠️ The Technology Stack

### Frontend (User Architecture)
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4
- **Animation Engine:** Framer Motion (Spring Physics & Absolute Relative Layouts)
- **Deployment Strategy:** Scaled independently via Vercel.

### Backend (AI Pipelines)
- **Core Server:** Python FastAPI
- **LLM Inferencing:** Groq Cloud (`llama-3.3-70b-versatile`)
- **Document Extractors:** `PyPDF2` Context Fetcher
- **CORS Logistics:** Environment-locked for production level endpoint safety.

---

## 🔌 Running Locally

### 1. The FastAPI Backend
Navigate to the backend directory, construct your virtual environment, and inject the environment keys.
```bash
cd ai-file-processor-backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```
**Required Environment Variables (`.env`):**
```env
GROQ_API_KEY=your_groq_key_here
FRONTEND_URL=http://localhost:5173
```
Run the server: `uvicorn app.main:app --reload`

### 2. The React Frontend
Navigate to the Vite UI directory and connect it to your backend.
```bash
cd file_processor_frontend
npm install
```
**Required Environment Variables (`.env`):**
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```
Run the UI: `npm run dev`

---

<p align="center">
  <i>Developed and designed by <b>Aftab Tamboli</b></i><br/>
  <a href="mailto:tamboliaftab84@gmail.com">tamboliaftab84@gmail.com</a> • <a href="https://www.linkedin.com/in/aftabt7">LinkedIn</a>
</p>
