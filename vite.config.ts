import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { devApiPlugin } from './vite/devApiPlugin'

export default defineConfig({
  plugins: [react(), devApiPlugin()],
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  },
  server: {
    host: '127.0.0.1',
    port: 5173
  }
})
