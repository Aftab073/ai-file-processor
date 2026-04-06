import os
import fitz  
from PIL import Image

def convert_image(file_path: str, target_format: str) -> str:
    """Converts an image to the target format (e.g., png, webp, jpeg)."""
    # Clean up the target format string (remove dots, make lowercase)
    target_format = target_format.lower().replace(".", "")
    if target_format == "jpg":
        target_format = "jpeg" # PIL expects 'jpeg' instead of 'jpg'
        
    # Generate the new filename
    base_name, _ = os.path.splitext(file_path)
    new_file_path = f"{base_name}.{target_format}"
    
    # Open, convert, and save the image
    with Image.open(file_path) as img:
        # If converting to JPEG, we must remove the Alpha (transparency) channel
        if target_format == "jpeg" and img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        
        img.save(new_file_path, format=target_format.upper())
        
    return new_file_path

def compress_pdf(file_path: str, target_kb: int) -> dict:
    """
    Attempts to compress a PDF. 
    Includes logic to skip compression if the file is already small enough!
    """
    original_size_kb = os.path.getsize(file_path) / 1024
    
    # EDGE CASE HANDLED: If it's already smaller, don't waste server CPU!
    if original_size_kb <= target_kb:
        return {
            "path": file_path, 
            "status": "skipped", 
            "message": f"File is already {round(original_size_kb)}KB, which is smaller than the {target_kb}KB target."
        }
    
    base_name, ext = os.path.splitext(file_path)
    new_file_path = f"{base_name}_compressed{ext}"
    
    # Basic PDF Compression using PyMuPDF (Garbage Collection and Deflate)
    doc = fitz.open(file_path)
    doc.save(
        new_file_path, 
        garbage=4, 
        deflate=True, 
        clean=True
    )
    doc.close()
    
    new_size_kb = os.path.getsize(new_file_path) / 1024
    
    return {
        "path": new_file_path,
        "status": "compressed",
        "message": f"Compressed from {round(original_size_kb)}KB to {round(new_size_kb)}KB."
    }