"""Offline upload/abuse regression checks; no external services."""
import asyncio
from io import BytesIO
from pathlib import Path
import sys
from unittest.mock import patch
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'backend'))
from routes import upload


def upload_client():
    app = FastAPI()
    app.include_router(upload.router)
    app.dependency_overrides[upload.verify_admin_token] = lambda: True
    return TestClient(app)


def test_executable_disguised_as_image_rejected():
    response = upload_client().post('/api/upload/image', files={'file': ('malware.png', b'MZexecutable', 'image/png')})
    assert response.status_code == 400


def test_executable_disguised_as_pdf_rejected():
    response = upload_client().post('/api/upload/document', files={'file': ('malware.pdf', b'MZexecutable', 'application/pdf')})
    assert response.status_code == 400


def test_valid_image_is_saved(tmp_path):
    stream = BytesIO()
    Image.new('RGB', (4, 4)).save(stream, 'PNG')
    with patch.object(upload, 'UPLOADS_DIR', tmp_path), patch.object(upload, 'CLOUDINARY_CONFIGURED', False):
        response = upload_client().post('/api/upload/image', files={'file': ('valid.png', stream.getvalue(), 'image/png')})
    assert response.status_code == 200
    assert len(list(tmp_path.iterdir())) == 1


def test_upload_size_limit_preserves_413():
    with patch.object(upload, 'MAX_IMAGE_BYTES', 4):
        response = upload_client().post('/api/upload/image', files={'file': ('large.png', b'12345', 'image/png')})
    assert response.status_code == 413


def test_delete_cannot_escape_upload_directory(tmp_path):
    from upload_validation import safe_upload_path
    from fastapi import HTTPException
    for name in ('../secret', '..\\secret', 'C:secret'):
        with pytest.raises(HTTPException) as error:
            safe_upload_path(tmp_path, name)
        assert error.value.status_code == 400


def test_rate_limit_ignores_forwarded_header():
    from rate_limit import AbuseProtectionMiddleware, MemoryRateLimiter
    app = FastAPI()
    @app.post('/api/orders/')
    async def order():
        return {'ok': True}
    app.add_middleware(AbuseProtectionMiddleware, limiter=MemoryRateLimiter(), policies={'/api/orders': (2, 60)})
    client = TestClient(app)
    assert client.post('/api/orders/', headers={'X-Forwarded-For': '1.1.1.1'}).status_code == 200
    assert client.post('/api/orders/', headers={'X-Forwarded-For': '2.2.2.2'}).status_code == 200
    response = client.post('/api/orders/', headers={'X-Forwarded-For': '3.3.3.3'})
    assert response.status_code == 429
    assert response.headers['retry-after']


def test_body_limit_rejects_chunked_body_without_content_length():
    from rate_limit import AbuseProtectionMiddleware, MemoryRateLimiter
    app = FastAPI()
    @app.post('/echo')
    async def echo():
        return {'ok': True}
    app.add_middleware(AbuseProtectionMiddleware, limiter=MemoryRateLimiter(), max_body_bytes=4)
    assert TestClient(app).post('/echo', content=iter([b'123', b'456'])).status_code == 413


def test_production_requires_redis(monkeypatch):
    from rate_limit import configured_limiter
    monkeypatch.setenv('APP_ENV', 'production')
    monkeypatch.delenv('REDIS_URL', raising=False)
    with pytest.raises(RuntimeError):
        configured_limiter()


def test_pdf_structure_and_active_content(tmp_path):
    from pypdf import PdfWriter
    writer = PdfWriter()
    writer.add_blank_page(width=100, height=100)
    stream = BytesIO()
    writer.write(stream)
    with patch.object(upload, 'DOCUMENTS_DIR', tmp_path), patch.object(upload, 'CLOUDINARY_CONFIGURED', False):
        response = upload_client().post('/api/upload/document', files={'file': ('safe.pdf', stream.getvalue(), 'application/pdf')})
    assert response.status_code == 200
    writer.add_js('app.alert("unsafe")')
    active = BytesIO()
    writer.write(active)
    assert upload_client().post('/api/upload/document', files={'file': ('active.pdf', active.getvalue(), 'application/pdf')}).status_code == 400
    assert upload_client().post('/api/upload/document', files={'file': ('broken.pdf', b'%PDF-1.7\ninvalid\n%%EOF', 'application/pdf')}).status_code == 400


def test_image_format_and_pixel_limits():
    stream = BytesIO()
    Image.new('RGB', (8, 8)).save(stream, 'PNG')
    assert upload_client().post('/api/upload/image', files={'file': ('false.jpg', stream.getvalue(), 'image/jpeg')}).status_code == 400
    with patch('upload_validation.MAX_PIXELS', 20):
        assert upload_client().post('/api/upload/image', files={'file': ('large.png', stream.getvalue(), 'image/png')}).status_code == 400


def test_appended_image_payload_removed(tmp_path):
    stream = BytesIO()
    Image.new('RGB', (4, 4)).save(stream, 'PNG')
    with patch.object(upload, 'UPLOADS_DIR', tmp_path), patch.object(upload, 'CLOUDINARY_CONFIGURED', False):
        response = upload_client().post('/api/upload/image', files={'file': ('polyglot.png', stream.getvalue() + b'APPENDED_EXECUTABLE_PAYLOAD', 'image/png')})
    assert response.status_code == 200
    assert b'APPENDED_EXECUTABLE_PAYLOAD' not in next(tmp_path.iterdir()).read_bytes()


def test_storage_failure_does_not_expose_details():
    stream = BytesIO()
    Image.new('RGB', (4, 4)).save(stream, 'PNG')
    with patch.object(upload, 'save_locally', side_effect=OSError('PRIVATE_SECRET_PATH')), patch.object(upload, 'CLOUDINARY_CONFIGURED', False):
        response = upload_client().post('/api/upload/image', files={'file': ('safe.png', stream.getvalue(), 'image/png')})
    assert response.status_code == 500
    assert 'PRIVATE_SECRET_PATH' not in response.text


def test_limiter_outage_fails_closed():
    from rate_limit import AbuseProtectionMiddleware
    from unittest.mock import AsyncMock
    app = FastAPI()
    limiter = AsyncMock()
    limiter.allow.side_effect = ConnectionError('private redis connection')
    app.add_middleware(AbuseProtectionMiddleware, limiter=limiter)
    response = TestClient(app).post('/api/admin/session')
    assert response.status_code == 503
    assert 'private redis' not in response.text


def test_security_headers_on_rejection():
    from rate_limit import AbuseProtectionMiddleware, MemoryRateLimiter, SecurityHeadersMiddleware
    app = FastAPI()
    app.add_middleware(AbuseProtectionMiddleware, limiter=MemoryRateLimiter(), max_body_bytes=4)
    app.add_middleware(SecurityHeadersMiddleware)
    response = TestClient(app).post('/echo', content=b'12345')
    assert response.status_code == 413
    assert response.headers['x-content-type-options'] == 'nosniff'


def test_rate_limit_all_auth_and_order_paths():
    from rate_limit import AbuseProtectionMiddleware, MemoryRateLimiter
    for path, maximum in [('/api/admin/session', 5), ('/api/admin/verify', 10), ('/api/orders/', 10)]:
        app = FastAPI()
        app.add_api_route(path, lambda: {'ok': True}, methods=['POST'])
        app.add_middleware(AbuseProtectionMiddleware, limiter=MemoryRateLimiter())
        client = TestClient(app)
        for _ in range(maximum):
            assert client.post(path).status_code == 200
        assert client.post(path).status_code == 429


def test_signed_proxy_identity_required_and_validated(monkeypatch):
    import hashlib
    import hmac
    import time
    from rate_limit import AbuseProtectionMiddleware, MemoryRateLimiter
    monkeypatch.setenv('PROXY_SHARED_SECRET', 'offline-shared-proxy-secret-long-enough')
    app = FastAPI()
    app.add_api_route('/api/orders/', lambda: {'ok': True}, methods=['POST'])
    app.add_middleware(AbuseProtectionMiddleware, limiter=MemoryRateLimiter(), policies={'/api/orders': (1, 60)})
    client = TestClient(app)
    def signed(ip, age=0):
        stamp = str(int(time.time()) - age)
        sig = hmac.new(b'offline-shared-proxy-secret-long-enough', f'{ip}|{stamp}'.encode(), hashlib.sha256).hexdigest()
        return {'X-Client-IP': ip, 'X-Client-IP-Time': stamp, 'X-Client-IP-Signature': sig}
    assert client.post('/api/orders/', headers=signed('192.0.2.1')).status_code == 200
    assert client.post('/api/orders/', headers=signed('192.0.2.2')).status_code == 200
    assert client.post('/api/orders/', headers=signed('192.0.2.1')).status_code == 429
    assert client.post('/api/orders/', headers={'X-Client-IP': '192.0.2.3'}).status_code == 200
    assert client.post('/api/orders/', headers=signed('192.0.2.4', age=60)).status_code == 429
