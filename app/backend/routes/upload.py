from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from dotenv import load_dotenv
from pathlib import Path
import logging
import os
import uuid
from starlette.concurrency import run_in_threadpool
from middleware import verify_admin_token
from upload_validation import read_bounded, validate_image, validate_pdf, safe_upload_path, MAX_IMAGE_BYTES, MAX_PDF_BYTES

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')
logger = logging.getLogger(__name__)
router = APIRouter(prefix='/api/upload', tags=['Upload'])
UPLOADS_DIR = ROOT_DIR / 'uploads'
DOCUMENTS_DIR = UPLOADS_DIR / 'documents'
DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)
CLOUDINARY_CONFIGURED = False
try:
    import cloudinary
    import cloudinary.uploader
    if os.environ.get('CLOUDINARY_URL'):
        cloudinary.config(secure=True)
        CLOUDINARY_CONFIGURED = True
    elif all(os.environ.get(k) for k in ('CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET')):
        cloudinary.config(cloud_name=os.environ['CLOUDINARY_CLOUD_NAME'], api_key=os.environ['CLOUDINARY_API_KEY'], api_secret=os.environ['CLOUDINARY_API_SECRET'], secure=True)
        CLOUDINARY_CONFIGURED = True
except ImportError:
    logger.warning('Cloudinary unavailable; local storage enabled')


def upload_to_cloudinary(data: bytes, filename: str, folder: str) -> str:
    result = cloudinary.uploader.upload(data, folder=folder, public_id=str(uuid.uuid4()), resource_type='raw' if filename.lower().endswith('.pdf') else 'image', overwrite=False)
    url = result.get('secure_url')
    if not url or not url.startswith('https://'):
        raise ValueError('Storage did not return a secure URL')
    return url


def save_locally(data: bytes, filename: str, directory: Path) -> str:
    name = f'{uuid.uuid4()}{Path(filename).suffix.lower()}'
    path = safe_upload_path(directory, name)
    with path.open('xb') as stream:
        stream.write(data)
    return f'/uploads/documents/{name}' if directory == DOCUMENTS_DIR else f'/uploads/{name}'


async def store(file: UploadFile, document: bool = False):
    filename = file.filename or ''
    if document and Path(filename).suffix.lower() != '.pdf':
        raise HTTPException(400, 'Only PDF documents are supported')
    try:
        data = await read_bounded(file, MAX_PDF_BYTES if document else MAX_IMAGE_BYTES)
        data = await run_in_threadpool(validate_pdf, data) if document else await run_in_threadpool(validate_image, data, filename)
        if CLOUDINARY_CONFIGURED:
            url = await run_in_threadpool(upload_to_cloudinary, data, filename, 'medtech/documents' if document else 'medtech/images')
            result = {'url': url, 'filename': filename, 'storage': 'cloudinary'}
        else:
            url = await run_in_threadpool(save_locally, data, filename, DOCUMENTS_DIR if document else UPLOADS_DIR)
            result = {'url': url, 'filename': url.rsplit('/', 1)[-1] if document else filename, 'storage': 'local'}
        if document:
            result['original_name'] = filename
        return result
    except HTTPException:
        raise
    except Exception:
        logger.exception('Upload storage failed')
        raise HTTPException(500, 'Unable to store upload') from None
    finally:
        await file.close()


@router.post('/', dependencies=[Depends(verify_admin_token)])
@router.post('/image', dependencies=[Depends(verify_admin_token)])
async def upload_image(file: UploadFile = File(...)):
    return await store(file)


@router.post('/document', dependencies=[Depends(verify_admin_token)])
async def upload_document(file: UploadFile = File(...)):
    return await store(file, document=True)


async def delete_local(filename: str, directory: Path):
    path = safe_upload_path(directory, filename)
    if not path.is_file():
        raise HTTPException(404, 'File not found')
    try:
        await run_in_threadpool(path.unlink)
    except OSError:
        logger.exception('Upload deletion failed')
        raise HTTPException(500, 'Unable to delete upload') from None
    return {'message': 'File deleted successfully'}


@router.delete('/image/{filename}', dependencies=[Depends(verify_admin_token)])
async def delete_image(filename: str):
    return await delete_local(filename, UPLOADS_DIR)


@router.delete('/document/{filename}', dependencies=[Depends(verify_admin_token)])
async def delete_document(filename: str):
    return await delete_local(filename, DOCUMENTS_DIR)
