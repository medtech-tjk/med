from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')
from middleware import verify_admin_token
import os
import uuid
from pathlib import Path
import shutil

router = APIRouter(prefix="/api/upload", tags=["Upload"])

# Create uploads directory if it doesn't exist
ROOT_DIR = Path(__file__).parent.parent
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# Create separate directory for documents
DOCUMENTS_DIR = UPLOADS_DIR / "documents"
DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
ALLOWED_DOCUMENT_EXTENSIONS = {'.pdf'}

def get_file_extension(filename: str) -> str:
    return Path(filename).suffix.lower()

@router.post("/", dependencies=[Depends(verify_admin_token)])
async def upload_file(file: UploadFile = File(...)):
    """Upload a file (Admin only) - main endpoint"""
    
    # Validate file extension
    ext = get_file_extension(file.filename)
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = UPLOADS_DIR / unique_filename
    
    # Save file
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Return URL path
    file_url = f"/uploads/{unique_filename}"
    return {"url": file_url, "filename": unique_filename}

@router.post("/image", dependencies=[Depends(verify_admin_token)])
async def upload_image(file: UploadFile = File(...)):
    """Upload an image file (Admin only)"""
    
    # Validate file extension
    ext = get_file_extension(file.filename)
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = UPLOADS_DIR / unique_filename
    
    # Save file
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Return URL path
    file_url = f"/uploads/{unique_filename}"
    return {"url": file_url, "filename": unique_filename}

@router.delete("/image/{filename}", dependencies=[Depends(verify_admin_token)])
async def delete_image(filename: str):
    """Delete an uploaded image (Admin only)"""
    file_path = UPLOADS_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        file_path.unlink()
        return {"message": "File deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")


@router.post("/document", dependencies=[Depends(verify_admin_token)])
async def upload_document(file: UploadFile = File(...)):
    """Upload a PDF document (Admin only)"""
    
    # Validate file extension
    ext = get_file_extension(file.filename)
    if ext not in ALLOWED_DOCUMENT_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_DOCUMENT_EXTENSIONS)}"
        )
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = DOCUMENTS_DIR / unique_filename
    
    # Save file
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Return URL path
    file_url = f"/uploads/documents/{unique_filename}"
    original_name = file.filename or "document.pdf"
    return {"url": file_url, "filename": unique_filename, "original_name": original_name}


@router.delete("/document/{filename}", dependencies=[Depends(verify_admin_token)])
async def delete_document(filename: str):
    """Delete an uploaded document (Admin only)"""
    file_path = DOCUMENTS_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        file_path.unlink()
        return {"message": "Document deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")
