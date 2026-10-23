import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base: the same build works at a domain root and under a sub-path such
  // as https://<user>.github.io/marienbraeu/.
  base: './',
  build: {
    outDir: 'dist',
    target: 'es2020',
    // Minifiers re-encode colours (rgba(18,11,6,.88) -> #120b06e0, i.e. alpha .878),
    // which shifts gradients by one colour level. Ship the CSS as authored.
    cssMinify: false,
  },
});
