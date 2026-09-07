import { defineConfig } from 'vite';

export default defineConfig({
  base: '/game-engine-2d/',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
