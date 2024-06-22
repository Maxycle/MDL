import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path'; // Import resolve from path module
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
      '@': resolve(__dirname, 'src') // Set up an alias for src directory
    }
  }
})
