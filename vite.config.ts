import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    // Strip console.* and debugger statements from production builds.
    drop: ['console', 'debugger'],
  },
  build: {
    rollupOptions: {
      output: {
        // Split React + ReactDOM into a separate vendor chunk so it can be
        // cached independently from app code between deployments.
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});
