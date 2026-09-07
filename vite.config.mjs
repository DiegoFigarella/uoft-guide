import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Same-origin /api in dev, matching how FastAPI serves both in production.
    // The api's routes already carry the /api prefix, so nothing is rewritten.
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
});
