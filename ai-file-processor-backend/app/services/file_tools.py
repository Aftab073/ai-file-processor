import os
import shutil
from PIL import Image
from ilovepdf import CompressTask  
import convertapi
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize ConvertAPI
convertapi.api_secret = os.getenv("CONVERTAPI_SECRET")
# Initialize iLovePDF Keys
ILOVEPDF_PUBLIC_KEY = os.getenv("ILOVEPDF_PUBLIC_KEY")
ILOVEPDF_SECRET_KEY = os.getenv("ILOVEPDF_SECRET_KEY") # <--- ADDED THIS

def convert_image(file_path: str, target_format: str) -> str:
    """Converts an image to the target format."""
    target_format = target_format.lower().replace(".", "")
    if target_format == "jpg":
        target_format = "jpeg"
        
    base_name, _ = os.path.splitext(file_path)
    new_file_path = f"{base_name}.{target_format}"
    
    with Image.open(file_path) as img:
        if target_format == "jpeg" and img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        img.save(new_file_path, format=target_format.upper())
        
    return new_file_path

# --- THIRD PARTY API INTEGRATIONS ---

def compress_with_ilovepdf(file_path: str, output_dir: str) -> str:
    """Uses official iLovePDF SDK to compress the file."""
    task = CompressTask(public_key=ILOVEPDF_PUBLIC_KEY, secret_key=ILOVEPDF_SECRET_KEY)
    task.compression_level = 'extreme' 
    task.add_file(file_path)
    task.execute()
    
    # 1. Create a temporary sub-folder to prevent overwriting the original!
    safe_out_dir = os.path.join(output_dir, "ilovepdf_temp")
    os.makedirs(safe_out_dir, exist_ok=True)
    
    # 2. Download the file into the safe folder
    task.download(safe_out_dir)
    
    # 3. Find the downloaded file
    base_name, ext = os.path.splitext(os.path.basename(file_path))
    downloaded_file = os.path.join(safe_out_dir, f"{base_name}{ext}")
    
    # 4. Move it back to the main folder with a NEW unique name
    final_new_path = os.path.join(output_dir, f"{base_name}_ilovepdf{ext}")
    shutil.move(downloaded_file, final_new_path)
    
    return final_new_path
def compress_with_convertapi(file_path: str) -> str:
    """Uses ConvertAPI SDK to compress the file."""
    base_name, ext = os.path.splitext(file_path)
    new_file_path = f"{base_name}_convertapi{ext}"
    
    result = convertapi.convert('compress', {
        'File': file_path
    }, from_format='pdf')
    
    result.file.save(new_file_path)
    return new_file_path

# --- THE MASTER FAILOVER MANAGER ---

def deep_compress_pdf(file_path: str, target_kb: int) -> dict:
    """
    Attempts to compress the PDF using a waterfall fallback strategy.
    Includes the Safety Net to prevent file size increases!
    """
    original_size_kb = os.path.getsize(file_path) / 1024
    output_directory = os.path.dirname(file_path)
    
    if original_size_kb <= target_kb:
        return {"path": file_path, "status": "skipped", "message": f"Already optimally sized at {round(original_size_kb)}KB."}

    # First attempt: iLovePDF (Now in Extreme Mode)
    try:
        new_path = compress_with_ilovepdf(file_path, output_directory)
        new_size_kb = os.path.getsize(new_path) / 1024
        
        # --- THE SAFETY NET IS BACK ---
        if new_size_kb >= original_size_kb:
            os.remove(new_path) # Delete the bad file
            raise Exception("PDF Paradox: iLovePDF increased the file size.")
            
        return {
            "path": new_path, 
            "status": "compressed", 
            "message": f"Deep compressed via iLovePDF from {round(original_size_kb)}KB to {round(new_size_kb)}KB"
        }
    except Exception as e:
        print(f"iLovePDF skipped: {e}")

    # Second attempt (Failover): ConvertAPI
    try:
        new_path = compress_with_convertapi(file_path)
        new_size_kb = os.path.getsize(new_path) / 1024
        
        # --- SAFETY NET FOR CONVERT API ---
        if new_size_kb >= original_size_kb:
            os.remove(new_path)
            raise Exception("PDF Paradox: ConvertAPI increased the file size.")
            
        return {
            "path": new_path, 
            "status": "compressed", 
            "message": f"Deep compressed via ConvertAPI from {round(original_size_kb)}KB to {round(new_size_kb)}KB"
        }
    except Exception as e:
        print(f"ConvertAPI skipped: {e}")
        
    # Total Failure Fallback: The file just can't be compressed anymore
    return {
        "path": file_path, 
        "status": "skipped", 
        "message": f"File is highly optimized (likely text/vector based). Cannot compress further than {round(original_size_kb)}KB without corrupting data."
    }