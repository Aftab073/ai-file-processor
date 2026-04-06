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
    You are an AI assistant for a file processing API. 
    Your job is to analyze the user's request and extract the intent into a structured JSON format.
    Do not return any conversational text, ONLY a valid JSON object matching the requested schema.
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