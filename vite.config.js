import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        app: './index.html'
      }
    }
  },
  server: {
    open: true
  }
});