import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: false,
      filename: 'bundle-report.html',
      gzipSize: true,
    }),
  ],
  server: {
    port: 5173,
  },
  define: {
    'process.env': {}
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});