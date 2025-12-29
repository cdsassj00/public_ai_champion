
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { cwd, env as processEnv } from 'node:process';

export default defineConfig(({ mode }) => {
  // Fix: use cwd() from node:process to avoid TypeScript error on process.cwd()
  const env = loadEnv(mode, cwd(), '');
  
  // Ensure the API_KEY is correctly pulled from process.env as per Gemini API requirements
  const resolvedApiKey = processEnv.API_KEY || env.API_KEY || env.VITE_API_KEY || "";
  
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(resolvedApiKey),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ""),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ""),
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        input: {
          main: './index.html'
        }
      }
    },
    server: {
      port: 3000,
      host: true
    }
  };
});
