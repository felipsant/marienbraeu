import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.ts'],
  // Our own reset lives in src/styles/base.css; preflight would override the button gradients.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        walnut: '#1e130c',
        copper: '#c86d3b',
        forest: '#1b3322',
        linen: '#faf6f0',
        amber: '#e5a93b',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
} satisfies Config;
