import { fileURLToPath, URL } from 'node:url'

import babel from '@rolldown/plugin-babel'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  resolve: {
    // 直接指向 packages/*/src,骨架阶段不做构建产物
    alias: {
      '@unified-todo/shared': fileURLToPath(
        new URL('../../packages/shared/src', import.meta.url),
      ),
      '@unified-todo/todo-core': fileURLToPath(
        new URL('../../packages/todo-core/src', import.meta.url),
      ),
      '@unified-todo/micro-app': fileURLToPath(
        new URL('../../packages/micro-app/src', import.meta.url),
      ),
    },
  },
})
