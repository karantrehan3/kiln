import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { buildInfoPlugin } from './vite/buildInfoPlugin.ts';

export default defineConfig({
  plugins: [react(), buildInfoPlugin({ repo: 'karantrehan3/kiln', deployBranch: 'master' })],
  server: {
    port: 4002,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:4001',
        changeOrigin: true,
      },
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
});
