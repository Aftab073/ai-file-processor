import os
import json
from groq import Groq
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# 1. Define the strict structure we want the AI to return
class FileActionIntent(BaseModel):
    action: str = Field(description="The main action requested. Must be one of: 'compress', 'convert', 'resize', 'split', 'unknown'")
    target_size_kb: int | None = Field(description="If compression is requested, the target size in Kilobytes (KB). Convert MB to KB. (e.g. 2MB = 2048).", default=None)
    target_format: str | None = Field(description="If conversion is requested, the target file extension (e.g., 'pdf', 'png', 'docx').", default=None)

def analyze_prompt_intent(user_prompt: str) -> dict:
    """
    Sends the user prompt to Groq and forces it to return JSON 
    matching our FileActionIntent structure.
    """
    system_prompt = """
    You are an AI file processing intent analyzer.
    You MUST output ONLY a raw JSON object. Do not include markdown formatting like ```json.
    
    You must use EXACTLY these keys and no others:
    - "action": MUST be exactly "compress", "convert", "resize", or "unknown". Do not use "compress_file".
    - "target_size_kb": Integer representing the target size in KB (e.g., if user says 2MB, output 2048). Null if not applicable.
    - "target_format": String representing the target extension (e.g., "png", "pdf"). Null if not applicable.
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile", # A fast, smart model
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Analyze this request: '{user_prompt}'"}
            ],
            # 2. Force the AI to output JSON that matches our Pydantic schema
            response_format={"type": "json_object", "schema": FileActionIntent.schema()},
            temperature=0.1, # Keep it low so the AI doesn't get overly creative
        )
        
        # 3. Parse the string response into a Python dictionary
        intent_json = json.loads(response.choices[0].message.content)
        return intent_json
        
    except Exception as e:
        print(f"AI Intent Error: {e}")
        return {"action": "error", "message": "Failed to understand prompt."}