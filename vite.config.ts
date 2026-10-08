import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/credvix-radar-v2/',
  plugins: [react(), tailwindcss()],
})