import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def transcribe_audio(file_path: str, language: str = "English") -> dict:
    """
    Sends the audio file to Groq's whisper model to generate a transcription incredibly fast.
    """
    try:
        with open(file_path, "rb") as file:
            kwargs = {
                "file": file,
                # whisper-large-v3-turbo is optimized for speed and high accuracy
                "model": "whisper-large-v3-turbo", 
            }
            
            # Map standard frontend language selections to Whisper language codes
            if language != "Auto":
                lang_map = {"English": "en", "French": "fr", "Spanish": "es"}
                if language in lang_map:
                    kwargs["language"] = lang_map[language]
                    
            # API Call
            transcription = client.audio.transcriptions.create(**kwargs)
            
            return {
                "status": "success",
                "text": transcription.text,
            }
    except Exception as e:
        print(f"Audio Transcription Error: {e}")
        return {
            "status": "error", 
            "message": str(e)
        }
