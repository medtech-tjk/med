import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv, transformWithOxc } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Match CRA's public variable contract without exposing server-only variables.
  const env = loadEnv(mode, process.cwd(), 'REACT_APP_');
  const serverEnv = loadEnv(mode, process.cwd(), ['BACKEND_URL', 'REACT_APP_']);
  const backend = serverEnv.BACKEND_URL || env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8001';
  const { REACT_APP_BACKEND_URL, ...clientEnv } = env;
  const publicEnv = { ...clientEnv, NODE_ENV: mode === 'test' ? 'test' : mode === 'production' ? 'production' : 'development', PUBLIC_URL: '' };

  return {
    plugins: [{
      name: 'legacy-js-as-jsx',
      enforce: 'pre',
      async transform(code, id) {
        if (/\/src\/.*\.js$/.test(id)) {
          return transformWithOxc(code, id, { lang: 'jsx', jsx: { runtime: 'automatic' } });
        }
      },
    }, react()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    define: { 'process.env': JSON.stringify(publicEnv) },
    // The established source tree includes JSX in .js as well as .jsx files.
    optimizeDeps: { rolldownOptions: { moduleTypes: { '.js': 'jsx' } } },
    build: { outDir: 'build', emptyOutDir: true },
    server: {
      port: 3000,
      hmr: process.env.DISABLE_HOT_RELOAD !== 'true',
      proxy: { '/api': { target: backend, changeOrigin: true }, '/uploads': { target: backend, changeOrigin: true } },
    },
    test: { environment: 'jsdom', globals: true, include: ['src/**/*.{test,spec}.{js,jsx}'] },
  };
});
