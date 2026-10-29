"""Shared atomic production rate limits; bounded development fallback and body buffering."""
import asyncio
from collections import OrderedDict
import hashlib
import hmac
import ipaddress
import os
import time
from starlette.responses import JSONResponse

POLICIES = {'/api/orders': (10, 60), '/api/admin/session': (5, 300), '/api/admin/verify': (10, 300)}
MAX_BODY_BYTES = 17 * 1024 * 1024


def client_identity(scope, headers):
    peer = (scope.get('client') or ('unknown', 0))[0]
    secret = os.environ.get('PROXY_SHARED_SECRET', '')
    if len(secret) < 32:
        return peer
    try:
        ip = headers.get(b'x-client-ip', b'').decode('ascii')
        stamp = headers.get(b'x-client-ip-time', b'').decode('ascii')
        signature = headers.get(b'x-client-ip-signature', b'').decode('ascii')
        address = ipaddress.ip_address(ip)
        if abs(time.time() - int(stamp)) > 30:
            return peer
        expected = hmac.new(secret.encode(), f'{ip}|{stamp}'.encode(), hashlib.sha256).hexdigest()
        if hmac.compare_digest(expected, signature):
            return str(address)
    except (ValueError, UnicodeError):
        pass
    return peer


class MemoryRateLimiter:
    """Development/testing only: per-process limits, with bounded expired-key storage."""
    def __init__(self):
        self.buckets = OrderedDict()
        self.lock = asyncio.Lock()

    async def allow(self, key, limit, window):
        async with self.lock:
            now = time.monotonic()
            while self.buckets and next(iter(self.buckets.values()))[1] <= now:
                self.buckets.popitem(last=False)
            count, expires = self.buckets.get(key, (0, now + window))
            if expires <= now:
                count, expires = 0, now + window
            if key not in self.buckets and len(self.buckets) >= 10000:
                return False, window  # saturation fails closed
            self.buckets[key] = (count + 1, expires)
            return count < limit, max(1, int(expires - now) + 1)

    async def close(self):
        pass


class RedisRateLimiter:
    SCRIPT = '''
local n = redis.call('INCR', KEYS[1])
if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
return {n, redis.call('TTL', KEYS[1])}
'''
    def __init__(self, url):
        from redis.asyncio import Redis
        self.redis = Redis.from_url(url, socket_connect_timeout=2, socket_timeout=2)

    async def allow(self, key, limit, window):
        count, ttl = await self.redis.eval(self.SCRIPT, 1, 'medtech:rate:' + hashlib.sha256(key.encode()).hexdigest(), window)
        return count <= limit, max(1, ttl)

    async def close(self):
        await self.redis.aclose()


def configured_limiter():
    url = os.environ.get('REDIS_URL', '').strip()
    environment = os.environ.get('APP_ENV', os.environ.get('ENVIRONMENT', 'development')).lower()
    production = environment in {'production', 'prod', 'staging'} or bool(os.environ.get('RAILWAY_ENVIRONMENT') or os.environ.get('RAILWAY_ENVIRONMENT_NAME') or os.environ.get('RAILWAY_ENVIRONMENT_ID'))
    if production and os.environ.get('FRONTEND_PROXY', '').lower() == 'true' and len(os.environ.get('PROXY_SHARED_SECRET', '')) < 32:
        raise RuntimeError('FRONTEND_PROXY requires a shared PROXY_SHARED_SECRET of at least 32 characters')
    if url:
        return RedisRateLimiter(url)
    if production:
        raise RuntimeError('REDIS_URL is required for shared production rate limiting')
    return MemoryRateLimiter()


class AbuseProtectionMiddleware:
    def __init__(self, app, limiter, policies=None, max_body_bytes=MAX_BODY_BYTES):
        self.app, self.limiter = app, limiter
        self.policies = POLICIES if policies is None else policies
        self.max_body_bytes = max_body_bytes

    async def __call__(self, scope, receive, send):
        if scope['type'] != 'http':
            return await self.app(scope, receive, send)
        path = scope.get('path', '').rstrip('/')
        headers = dict(scope.get('headers', []))
        async def reject(status, detail, extra=None):
            await JSONResponse({'detail': detail}, status_code=status, headers=extra)(scope, receive, send)
        if scope['method'] == 'POST' and path in self.policies:
            # scope.client comes from the trusted ASGI server. X-Forwarded-For is never read here.
            identity = client_identity(scope, headers)
            limit, window = self.policies[path]
            try:
                allowed, retry = await self.limiter.allow(path + ':' + identity, limit, window)
            except Exception:
                return await reject(503, 'Request protection temporarily unavailable')
            if not allowed:
                return await reject(429, 'Too many requests', {'Retry-After': str(retry)})
        cap = self.max_body_bytes if path.startswith('/api/upload') else min(self.max_body_bytes, 1024 * 1024)
        try:
            declared = int(headers.get(b'content-length', b'0'))
            if declared < 0:
                raise ValueError()
        except ValueError:
            return await reject(400, 'Invalid Content-Length')
        if declared > cap:
            return await reject(413, 'Request body exceeds size limit')
        # Consume before multipart parsing, also bounding chunked bodies with no Content-Length.
        chunks, size = [], 0
        while True:
            message = await receive()
            if message['type'] == 'http.disconnect':
                return
            data = message.get('body', b'')
            size += len(data)
            if size > cap:
                return await reject(413, 'Request body exceeds size limit')
            chunks.append(data)
            if not message.get('more_body', False):
                break
        body = b''.join(chunks)
        delivered = False
        async def bounded_receive():
            nonlocal delivered
            if not delivered:
                delivered = True
                return {'type': 'http.request', 'body': body, 'more_body': False}
            return await receive()
        await self.app(scope, bounded_receive, send)


class SecurityHeadersMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        async def secure_send(message):
            if message['type'] == 'http.response.start':
                headers = list(message.get('headers', []))
                headers.extend([(b'x-content-type-options', b'nosniff'), (b'x-frame-options', b'DENY'), (b'referrer-policy', b'strict-origin-when-cross-origin'), (b'permissions-policy', b'camera=(), microphone=(), geolocation=()')])
                if scope.get('scheme') == 'https':
                    headers.append((b'strict-transport-security', b'max-age=31536000; includeSubDomains'))
                if scope.get('path', '').startswith('/uploads'):
                    headers.append((b'content-security-policy', b"sandbox; default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'"))
                message['headers'] = headers
            await send(message)
        await self.app(scope, receive, secure_send)

