import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://localhost:3000'
    },
    hmr: {
      overlay: true
    }
  },
  build: {
    outDir: 'dist'
  },
  css: {
    devSourcemap: true
  }
})
