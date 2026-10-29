# Backend hardening configuration

Set APP_ENV=production, REDIS_URL (shared Redis for all replicas), MONGO_URL,
DB_NAME, and ADMIN_TOKEN (at least 32 random characters) in deployment secrets.
Redis absence in production or Railway environments prevents startup. Redis failure
rejects protected requests with 503; it never falls back to per-worker memory.
Development without REDIS_URL uses bounded process-local counters only.

Limits per actual ASGI client peer: orders 10/minute; admin login 5/5 minutes;
admin verification 10/5 minutes. 429 carries Retry-After. Configure an edge limit
as well when the application sees a shared proxy peer. Deployment commands use
--no-proxy-headers, so arbitrary forwarded headers cannot change identity. If an
operator enables forwarded processing, only trusted infrastructure peers may set it.

Images: 8 MiB, maximum20 million pixels, matching decoded format, Pillow verify
and full decode, then re-encoded without original metadata or appended data.
PDF:16 MiB, strict parse,500-page limit, rejects encryption and active content.
Multipart body limit17 MiB is enforced before parsing, including chunked bodies.
Other bodies are limited to1 MiB. Invalid files400; oversized413. Storage errors
return generic500. Local delete paths cannot escape the upload directory.
PDF content is untrusted; uploads are served with a sandbox CSP and nosniff.

/api/health checks MongoDB and configured Redis, returning503 on unavailable state.
Startup creates indexes; it is intentionally not healthy until dependencies work.
Nixpacks uses Python3.13. Local test environment uses Python3.14.2; production
Linux/Python3.13 deployment still needs a staging smoke check.
