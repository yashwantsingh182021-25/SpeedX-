import { defineConfig } from 'vite';

// base './' so the build works from any sub-path (e.g. GitHub Pages /SpeedX-/).
export default defineConfig({
  base: './',
  build: { target: 'es2022' },
});
