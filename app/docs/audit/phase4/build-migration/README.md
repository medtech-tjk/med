# Frontend build migration evidence

Verified on Node 24.13.0 / npm 11.6.2, 2026-10-29.

- Vite 8.3.5, @vitejs/plugin-react 6.1.2, Vitest 5.0.5, jsdom 27.4.0.
- Clean `npm ci --no-fund`: passed, 542 packages installed.
- `npm run build`: passed (including sitemap postbuild), output remains frontend/build/.
- `npm test`: passed, 6 suites / 11 tests.
- Development HTTP smoke: HTML, index.js, App.js, LanguageContext.js all return 200 and transformed modules.
- Config smoke: CRA public prefix preserved, private/backend variables excluded from browser defines; API/uploads proxy and build directory verified.
- npm audit before migration: {'info': 0, 'low': 17, 'moderate': 5, 'high': 14, 'critical': 0, 'total': 36}.
- npm audit after migration: {'info': 0, 'low': 0, 'moderate': 0, 'high': 0, 'critical': 0, 'total': 0}.
- Production-only npm audit: {'info': 0, 'low': 0, 'moderate': 0, 'high': 0, 'critical': 0, 'total': 0}.

Removed CRA/CRACO, obsolete Babel workaround, CRA template and unused axios. ESLint updated within major 9 to resolve its advisory. React19, source JSX-in-JS, @ alias, public assets, PostCSS/Tailwind and REACT_APP_* access remain supported. Only two existing test files required Jest-to-Vitest mock API imports; domain source was not edited.

Runtime/deployment: Vitest5 requires Node >=22.12 and supported majors; package engines and Nixpacks updated to Node24. npm legacy peer mode remains because existing optional UI dependencies have old peer ranges.

Compatibility notes: old optional webpack visual-edit and health plugins are retired with CRACO. ESLint9 emits an upstream end-of-support warning, but has no audit finding; its major was retained to avoid changing existing plugin compatibility. The bundled application remains ~655KB minified (~181KB gzip), triggering Vite's size warning; route splitting is outside this build-only change. Sitemap build has static pages only when REACT_APP_BACKEND_URL is absent, preserving prior behavior.

Primary docs consulted:
- https://vite.dev/guide/
- https://vite.dev/config/shared-options.html
- https://vite.dev/config/dep-optimization-options.html
- https://vitest.dev/guide/migration/

Changed frontend files: package.json, package-lock.json, vite.config.mjs (added), index.html (moved and adapted from public/index.html), public/index.html (removed), craco.config.js (removed), nixpacks.toml, tailwind.config.js, README.md, src/hooks/useApi.test.js, src/lib/adminApi.test.js (mechanical vi import/mock rename before primary takes ownership of this test). Generated frontend/build/ refreshed.
