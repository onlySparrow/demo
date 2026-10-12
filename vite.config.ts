import { fileURLToPath, URL } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  resolve: {
    alias: {
      '@unified-todo/shared': fileURLToPath(
        new URL('./src/packages/shared/src', import.meta.url),
      ),
      '@unified-todo/todo-core': fileURLToPath(
        new URL('./src/packages/todo-core/src', import.meta.url),
      ),
      '@unified-todo/micro-app': fileURLToPath(
        new URL('./src/packages/micro-app/src', import.meta.url),
      ),
    },
  },
})
