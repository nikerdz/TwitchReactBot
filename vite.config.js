import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: 'client',
  base: './',
  plugins: [react()],
  build: {
    outDir: '../docs',
    emptyOutDir: true
  },
  server: {
    port: 5174,
    proxy: {
      '/api': 'https://backend-bridge--bugwoozin.replit.app/api/reactions'
    }
  }
})
