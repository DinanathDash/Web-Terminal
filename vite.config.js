import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to local server during development
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // Proxy Socket.IO requests to local server during development
      '/socket.io': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
      }
    }
  },
})
