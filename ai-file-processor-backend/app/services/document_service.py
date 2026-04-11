import os
import PyPDF2
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def extract_text_from_pdf(file_path: str) -> str:
    """Extracts raw text from a PDF file."""
    text = ""
    try:
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        return text
    except Exception as e:
        print(f"PDF Extraction Error: {e}")
        return ""

def chat_with_document(document_text: str, question: str) -> dict:
    """
    Feeds the extracted text to Groq Llama alongside the user's question as strict context.
    """
    try:
        # Llama 3 70B has a massive context window up to 128k
        system_prompt = (
            "You are a helpful, highly accurate AI document assistant. "
            "You MUST base your answers STRICTLY on the document text provided below. "
            "If the document does not contain the answer, say 'I cannot find the answer to this in the uploaded document.'\n\n"
            f"--- DOCUMENT CONTENT ---\n{document_text[:100000]}\n--- END OF DOCUMENT ---" # Safe truncation if file is absurdly massive
        )
        
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question}
            ],
            temperature=0.1, # Keep it extremely grounded and less hallucinatory
        )
        
        return {
            "status": "success",
            "answer": response.choices[0].message.content
        }
    except Exception as e:
        print(f"Groq Chat Error: {e}")
        return {
            "status": "error",
            "message": str(e)
        }
