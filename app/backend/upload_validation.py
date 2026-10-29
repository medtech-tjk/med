"""Bounded reads and file-content validation before persistence."""
from io import BytesIO
from pathlib import Path
import warnings
from fastapi import HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError
from pypdf import PdfReader

MAX_IMAGE_BYTES = 8 * 1024 * 1024
MAX_PDF_BYTES = 16 * 1024 * 1024
MAX_PIXELS = 20_000_000
IMAGE_FORMATS = {'.jpg': 'JPEG', '.jpeg': 'JPEG', '.png': 'PNG', '.gif': 'GIF', '.webp': 'WEBP'}


async def read_bounded(file: UploadFile, limit: int) -> bytes:
    data = bytearray()
    while True:
        chunk = await file.read(min(64 * 1024, limit + 1 - len(data)))
        if not chunk:
            return bytes(data)
        data.extend(chunk)
        if len(data) > limit:
            raise HTTPException(413, 'File exceeds upload size limit')


def validate_image(data: bytes, filename: str) -> bytes:
    expected = IMAGE_FORMATS.get(Path(filename).suffix.lower())
    if not expected:
        raise HTTPException(400, 'Unsupported image type')
    try:
        with warnings.catch_warnings():
            warnings.simplefilter('error', Image.DecompressionBombWarning)
            with Image.open(BytesIO(data)) as image:
                if image.format != expected or image.width * image.height > MAX_PIXELS:
                    raise ValueError('Invalid image format or dimensions')
                image.verify()
            # Decode and re-encode to discard appended payloads and untrusted metadata.
            with Image.open(BytesIO(data)) as image:
                image.load()
                image = image.convert('RGB' if expected == 'JPEG' else 'RGBA')
                output = BytesIO()
                image.save(output, format=expected)
                result = output.getvalue()
                if len(result) > MAX_IMAGE_BYTES:
                    raise HTTPException(413, 'Decoded image exceeds upload size limit')
                return result
    except HTTPException:
        raise
    except (ValueError, OSError, SyntaxError, UnidentifiedImageError, Image.DecompressionBombError, Image.DecompressionBombWarning):
        raise HTTPException(400, 'Invalid or unsafe image') from None


def validate_pdf(data: bytes) -> bytes:
    if not data.startswith(b'%PDF-') or not data.rstrip().endswith(b'%%EOF'):
        raise HTTPException(400, 'Invalid PDF document')
    try:
        reader = PdfReader(BytesIO(data), strict=True)
        if reader.is_encrypted or not 0 < len(reader.pages) <= 500:
            raise ValueError('Encrypted or excessive pages')
        # Reject active content and embedded files, including in unreferenced objects.
        # PDF names may escape characters with #hex, so normalize before checking.
        import re
        normalized = re.sub(rb'#([0-9a-fA-F]{2})', lambda m: bytes([int(m[1], 16)]), data)
        if re.search(rb'/(JavaScript|JS|Launch|EmbeddedFile|Filespec|OpenAction|AA|RichMedia|XFA)\b', normalized):
            raise ValueError('Active PDF content')
        return data
    except Exception:
        raise HTTPException(400, 'Invalid or unsafe PDF document') from None


def safe_upload_path(directory: Path, filename: str) -> Path:
    if not filename or Path(filename).name != filename or '/' in filename or '\\' in filename or ':' in filename:
        raise HTTPException(400, 'Invalid filename')
    target = (directory / filename).resolve()
    if target.parent != directory.resolve():
        raise HTTPException(400, 'Invalid filename')
    return target
