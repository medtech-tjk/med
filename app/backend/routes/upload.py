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
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/upload", tags=["Upload"])

# Create uploads directory if it doesn't exist (fallback for local storage)
ROOT_DIR = Path(__file__).parent.parent
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# Create separate directory for documents
DOCUMENTS_DIR = UPLOADS_DIR / "documents"
DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
ALLOWED_DOCUMENT_EXTENSIONS = {'.pdf'}

# ============================================================
# Cloudinary Configuration
# Supports both CLOUDINARY_URL and separate env vars
# ============================================================
CLOUDINARY_CONFIGURED = False

try:
    import cloudinary
    import cloudinary.uploader

    cloudinary_url = os.environ.get('CLOUDINARY_URL')
    cloud_name = os.environ.get('CLOUDINARY_CLOUD_NAME')
    api_key = os.environ.get('CLOUDINARY_API_KEY')
    api_secret = os.environ.get('CLOUDINARY_API_SECRET')

    if cloudinary_url:
        # CLOUDINARY_URL format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
        # The cloudinary library auto-parses this from env
        os.environ['CLOUDINARY_URL'] = cloudinary_url
        cloudinary.config()
        CLOUDINARY_CONFIGURED = True
        logger.info(f"✅ Cloudinary configured via CLOUDINARY_URL")
    elif cloud_name and api_key and api_secret:
        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret,
            secure=True
        )
        CLOUDINARY_CONFIGURED = True
        logger.info(f"✅ Cloudinary configured: cloud_name={cloud_name}")
    else:
        logger.warning("⚠️ Cloudinary env vars not set, falling back to local storage")
except ImportError:
    logger.warning("⚠️ cloudinary package not installed, falling back to local storage")


def get_file_extension(filename: str) -> str:
    return Path(filename).suffix.lower()


def upload_to_cloudinary(file_bytes: bytes, filename: str, folder: str = "medtech") -> str:
    """Upload a file to Cloudinary and return the secure URL."""
    import cloudinary.uploader
    
    result = cloudinary.uploader.upload(
        file_bytes,
        folder=folder,
        public_id=f"{uuid.uuid4()}",
        resource_type="auto",
        overwrite=True
    )
    return result.get("secure_url", "")


def save_locally(file, filename: str, directory: Path) -> str:
    """Save a file locally and return the URL path."""
    unique_filename = f"{uuid.uuid4()}{get_file_extension(filename)}"
    file_path = directory / unique_filename
    
    with file_path.open("wb") as buffer:
        if hasattr(file, 'read'):
            shutil.copyfileobj(file, buffer)
        else:
            buffer.write(file)
    
    # Return relative URL
    if directory == DOCUMENTS_DIR:
        return f"/uploads/documents/{unique_filename}"
    return f"/uploads/{unique_filename}"


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
    
    try:
        file_bytes = await file.read()
        
        if CLOUDINARY_CONFIGURED:
            # Upload to Cloudinary
            url = upload_to_cloudinary(file_bytes, file.filename, folder="medtech/images")
            return {"url": url, "filename": file.filename, "storage": "cloudinary"}
        else:
            # Fallback: save locally
            await file.seek(0)
            url = save_locally(file.file, file.filename, UPLOADS_DIR)
            return {"url": url, "filename": file.filename, "storage": "local"}
            
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")


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
    
    try:
        file_bytes = await file.read()
        
        if CLOUDINARY_CONFIGURED:
            url = upload_to_cloudinary(file_bytes, file.filename, folder="medtech/images")
            return {"url": url, "filename": file.filename, "storage": "cloudinary"}
        else:
            await file.seek(0)
            url = save_locally(file.file, file.filename, UPLOADS_DIR)
            return {"url": url, "filename": file.filename, "storage": "local"}
            
    except Exception as e:
        logger.error(f"Image upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")


@router.delete("/image/{filename}", dependencies=[Depends(verify_admin_token)])
async def delete_image(filename: str):
    """Delete an uploaded image (Admin only)"""
    
    # If it's a Cloudinary URL, try to delete from Cloudinary
    if CLOUDINARY_CONFIGURED and ('cloudinary' in filename or '/' in filename):
        try:
            import cloudinary.uploader
            # Extract public_id from Cloudinary URL
            # URL format: https://res.cloudinary.com/cloud_name/image/upload/v123/folder/public_id.ext
            if 'res.cloudinary.com' in filename:
                parts = filename.split('/upload/')
                if len(parts) > 1:
                    public_id = parts[1].rsplit('.', 1)[0]  # Remove extension
                    # Remove version prefix if present (v12345/)
                    if public_id.startswith('v') and '/' in public_id:
                        public_id = public_id.split('/', 1)[1]
                    cloudinary.uploader.destroy(public_id)
                    return {"message": "File deleted from Cloudinary successfully"}
        except Exception as e:
            logger.error(f"Cloudinary delete failed: {e}")
    
    # Fallback: try to delete locally
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
    
    original_name = file.filename or "document.pdf"
    
    try:
        file_bytes = await file.read()
        
        if CLOUDINARY_CONFIGURED:
            url = upload_to_cloudinary(file_bytes, file.filename, folder="medtech/documents")
            return {"url": url, "filename": file.filename, "original_name": original_name, "storage": "cloudinary"}
        else:
            await file.seek(0)
            url = save_locally(file.file, file.filename, DOCUMENTS_DIR)
            unique_filename = url.split('/')[-1]
            return {"url": url, "filename": unique_filename, "original_name": original_name, "storage": "local"}
            
    except Exception as e:
        logger.error(f"Document upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")


@router.delete("/document/{filename}", dependencies=[Depends(verify_admin_token)])
async def delete_document(filename: str):
    """Delete an uploaded document (Admin only)"""
    
    if CLOUDINARY_CONFIGURED and ('cloudinary' in filename or '/' in filename):
        try:
            import cloudinary.uploader
            if 'res.cloudinary.com' in filename:
                parts = filename.split('/upload/')
                if len(parts) > 1:
                    public_id = parts[1].rsplit('.', 1)[0]
                    if public_id.startswith('v') and '/' in public_id:
                        public_id = public_id.split('/', 1)[1]
                    cloudinary.uploader.destroy(public_id, resource_type="raw")
                    return {"message": "Document deleted from Cloudinary successfully"}
        except Exception as e:
            logger.error(f"Cloudinary document delete failed: {e}")
    
    file_path = DOCUMENTS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        file_path.unlink()
        return {"message": "Document deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")
