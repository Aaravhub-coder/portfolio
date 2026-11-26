import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  // Serves cleanly at root during local dev, and at /portfolio/ on GitHub Pages
  base: command === 'build' ? '/portfolio/' : '/',
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'three-core',
              test: /node_modules\/three\//,
              priority: 30,
            },
            {
              name: 'r3f-ecosystem',
              test: /node_modules\/@react-three\//,
              priority: 25,
            },
            {
              name: 'react-vendor',
              test: /node_modules\/(react|react-dom|scheduler)\//,
              priority: 20,
            },
            {
              name: 'animation-ui',
              test: /node_modules\/(gsap|zustand|lucide-react)\//,
              priority: 15,
            },
          ],
        },
      },
    },
  },
}));
