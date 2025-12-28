
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {} // Vercel 환경 변수와 호환되도록 설정
  },
  build: {
    outDir: 'dist',
  }
});
