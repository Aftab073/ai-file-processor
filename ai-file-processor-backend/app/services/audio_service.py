import os
import uuid
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Directory for temp audio downloads
UPLOAD_DIR = os.path.abspath("temp_uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


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
                lang_map = {
                    "English": "en",
                    "Hindi": "hi",
                    "French": "fr",
                    "Spanish": "es",
                }
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


def summarize_transcript(text: str) -> str:
    """
    Uses Groq's Llama-3 to generate a concise AI summary of the transcribed text.
    Returns a 3-4 sentence TL;DR.
    """
    if not text or len(text.strip()) < 50:
        return "Transcript too short to generate a meaningful summary."
    
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a professional summarizer. Given a transcript of audio/video content, "
                        "produce a concise summary in 3-4 sentences. Focus on the key topics discussed, "
                        "main conclusions, and any action items. Be direct and informative. "
                        "Do NOT start with 'This transcript...' or 'The speaker...'. "
                        "Just state the core information naturally."
                    )
                },
                {
                    "role": "user",
                    "content": f"Summarize this transcript:\n\n{text[:4000]}"  # Cap at 4000 chars to stay within context window
                }
            ],
            temperature=0.3,
            max_tokens=300,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Summary Generation Error: {e}")
        return "Summary could not be generated."


def download_audio_from_url(url: str, max_duration_seconds: int = 300) -> dict:
    """
    Uses yt-dlp to extract audio from a URL (YouTube, Instagram, Twitter, etc.).
    Saves as a temporary .mp3 file. Caps duration at max_duration_seconds (default 5 min).
    """
    try:
        import yt_dlp
        
        # First, probe the video duration without downloading
        probe_opts = {
            'quiet': True,
            'no_warnings': True,
            'skip_download': True,
        }
        
        with yt_dlp.YoutubeDL(probe_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            duration = info.get('duration', 0)
            title = info.get('title', 'Unknown')
            
            if duration and duration > max_duration_seconds:
                return {
                    "status": "error",
                    "message": f"Video is {duration // 60}m {duration % 60}s long. Maximum allowed is {max_duration_seconds // 60} minutes to prevent server timeout."
                }
        
        # Download audio-only stream directly (no ffmpeg needed)
        # Whisper natively supports m4a, webm, mp3, wav, etc.
        output_filename = f"{uuid.uuid4()}"
        output_path = os.path.join(UPLOAD_DIR, output_filename)
        
        download_opts = {
            # Prefer audio-only streams to avoid needing ffmpeg
            'format': 'bestaudio[ext=m4a]/bestaudio[ext=webm]/bestaudio/best',
            'outtmpl': output_path + '.%(ext)s',
            'quiet': True,
            'no_warnings': True,
            'socket_timeout': 30,
            # No postprocessors — skip ffmpeg entirely
        }
        
        with yt_dlp.YoutubeDL(download_opts) as ydl:
            ydl.download([url])
        
        # Find the downloaded file (extension varies: .m4a, .webm, .mp3, etc.)
        final_path = None
        for f in os.listdir(UPLOAD_DIR):
            if f.startswith(output_filename):
                final_path = os.path.join(UPLOAD_DIR, f)
                break
        
        if not final_path or not os.path.exists(final_path):
            return {
                "status": "error",
                "message": "Failed to download audio. The URL may be unsupported or private."
            }
        
        return {
            "status": "success",
            "file_path": final_path,
            "title": title,
            "duration": duration,
        }
        
    except Exception as e:
        print(f"URL Download Error: {e}")
        error_msg = str(e)
        if "Unsupported URL" in error_msg or "not a valid URL" in error_msg:
            error_msg = "This URL is not supported. Try a YouTube, Instagram, or Twitter link."
        elif "Private" in error_msg or "login" in error_msg.lower():
            error_msg = "This content is private or requires login. Only public content can be transcribed."
        else:
            error_msg = f"Could not extract audio from this URL. Error: {error_msg[:150]}"
        
        return {
            "status": "error",
            "message": error_msg
        }
