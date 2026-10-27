import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Pure modules shared with the backend (e.g. readiness scoring).
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    // The app shell (React, Chakra UI, Framer Motion and the app's routes) is one ~520 kB
    // chunk, ~175 kB gzipped; pages and the chart load separately. Splitting the libraries
    // into their own chunks (manualChunks) broke module order in production (blank page),
    // so the limit is set just above the shell instead.
    chunkSizeWarningLimit: 600,
  },
});
