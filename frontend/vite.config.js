import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: "../public",
    emptyOutDir: true
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    proxy: {
      '/': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
