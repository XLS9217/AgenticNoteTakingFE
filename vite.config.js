import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
//
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendAddress = env.VITE_BACKEND_ADDRESS || 'http://localhost:7008'

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 7007,
      proxy: {
        '/api': {
          target: backendAddress,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/agent': {
          target: backendAddress,
          changeOrigin: true,
          ws: true,
        },
      },
    },
  }
})