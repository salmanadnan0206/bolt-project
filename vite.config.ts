import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api/generate-prompt': {
        target: 'https://itexpert2210.app.n8n.cloud/webhook/cc92b7f6-a83f-4275-a822-07d217c63716',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/generate-prompt/, ''),
        secure: true,
      }
    }
  }
});