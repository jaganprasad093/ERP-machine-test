import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBaseUrl =
    process.env.API_BASE_URL ||
    env.API_BASE_URL ||
    process.env.VITE_API_BASE_URL ||
    env.VITE_API_BASE_URL ||
    '';

  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    envPrefix: ['VITE_', 'API_'],
    define: {
      'import.meta.env.API_BASE_URL': JSON.stringify(apiBaseUrl)
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
});
