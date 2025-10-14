import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 7007,
    proxy: {
      '/api': {
        target: 'http://172.16.16.202:7008',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/agent': {
        target: 'http://172.16.16.202:7008',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
