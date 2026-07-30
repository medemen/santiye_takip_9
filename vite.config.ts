import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/santiye_takip_9/',
  server: {
    allowedHosts: ['cache-circle-balancing.ngrok-free.dev'],
  },
})
