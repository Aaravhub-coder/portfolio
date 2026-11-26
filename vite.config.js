import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) {
            return 'three-core';
          }
          if (
            id.includes('node_modules/@react-three/fiber') ||
            id.includes('node_modules/@react-three/drei')
          ) {
            return 'r3f-ecosystem';
          }
          if (
            id.includes('node_modules/gsap') ||
            id.includes('node_modules/zustand') ||
            id.includes('node_modules/lucide-react')
          ) {
            return 'animation-ui';
          }
          return undefined;
        },
      },
    },
  },
});
