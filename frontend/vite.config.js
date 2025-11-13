const { defineConfig, loadEnv } = require('vite');
const vue = require('@vitejs/plugin-vue');
const { resolve } = require('path');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');

module.exports = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [vue()],
    build: {
      outDir: "../public",
      emptyOutDir: true,
      rollupOptions: {
        external: ['Flag_of_Anarcho-capitalism.png']
      }
    },
    css: {
      postcss: {
        plugins: [tailwindcss, autoprefixer],
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      proxy: {
        '^/api/(.*)': {
          target: env.VITE_BACKEND_URL || 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  }
});


