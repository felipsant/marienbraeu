import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base: the same build works at a domain root and under a sub-path such
  // as https://<user>.github.io/marienbraeu/.
  base: './',
  build: {
    outDir: 'dist',
    target: 'es2020',
  },
});
