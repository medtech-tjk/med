# Tib Technology frontend

React 19 application built with Vite and tested with Vitest.

Use Node.js 22.12 or newer supported LTS (Node 24 is configured for Nixpacks) and npm 11. Install reproducibly with `npm ci`.

- `npm start`: development server at http://localhost:3000, with React refresh.
- `npm test`: run all unit tests once in jsdom.
- `npm run test:watch`: interactive test watch mode.
- `npm run build`: production assets in `build/`, followed by sitemap generation.
- `npm run serve`: Express production server serving `build/` and proxying backend requests.

`index.html` is the Vite entry point. Public assets remain in `public/`. The `@` source alias and JSX in existing `.js` files are supported without renaming application files. Tailwind/PostCSS configuration is retained.

Browser API and upload requests always use the site origin. The production Express server proxies `/api/*` and `/uploads/*` to the server-only `BACKEND_URL`, preserving session cookies. In development, Vite proxies the same paths to `BACKEND_URL` (fallback `REACT_APP_BACKEND_URL` or `http://127.0.0.1:8001`). Never put backend URLs containing credentials, or any secrets, in public `REACT_APP_*` variables. `DISABLE_HOT_RELOAD=true` disables refresh.

For production, set `BACKEND_URL` and `PROXY_SHARED_SECRET` in the frontend service environment. Set the identical `PROXY_SHARED_SECRET`, `FRONTEND_PROXY=true`, `ADMIN_TOKEN` (32+ random characters), `MONGO_URL`, `DB_NAME`, and shared `REDIS_URL` in the backend service environment. Set `TRUST_PROXY` only to the actual trusted ingress topology (for example, a verified single proxy hop); do not guess this value. The app's `.env.example` files list the expected keys. The obsolete plaintext `backend/admin_token.txt` was removed; provision a fresh login key in the deployment secret store.

The CRACO/webpack build chain has been retired, including its optional webpack health and visual-edit plugins. Production health and API routes belong to Express. The sitemap postbuild script retains its existing environment-variable behavior.
