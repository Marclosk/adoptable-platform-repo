import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const proxyUrl = env.VITE_PROXY_URL;
  if (!proxyUrl) {
    throw new Error(
      '🛑 VITE_PROXY_URL no está definida. Comprueba tu archivo .env'
    );
  }

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: proxyUrl,
          changeOrigin: true,
          secure: false,
        },
        '/users': {
          target: proxyUrl,
          changeOrigin: true,
          secure: false,
        },
        '/csrf-token': {
          target: proxyUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: 'dist',
    },
    define: {
      'process.env.VITE_PROXY_URL': JSON.stringify(proxyUrl),
    },
  };
});
