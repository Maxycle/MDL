import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// In development the PHP API runs on :8081 (php -S 127.0.0.1:8081 api/index.php).
// In production both live on the same domain, so no proxy and no CORS.
export default defineConfig({
  // Where the site lives: "/" for a domain root, "/libertarien.net/" for a subfolder (set by build.ps1 -BasePath).
  base: process.env.MDL_BASE || '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:8081',
      '/uploads': 'http://127.0.0.1:8081',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
