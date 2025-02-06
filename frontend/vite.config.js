import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig(({ mode }) => {
  // Load env variables based on mode
  const env = loadEnv(mode, process.cwd(), '');

  console.log('VITE_BACKEND_URL:', env.VITE_BACKEND_URL);
	console.log('VITE_TEST_VAR:', env.VITE_TEST_VAR);

  return {
    plugins: [vue()],
    build: {
      outDir: "../public",
      emptyOutDir: true,
      rollupOptions: {
        external: ['img/Flag_of_Anarcho-capitalism.png']
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
})
