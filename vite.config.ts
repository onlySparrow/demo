import { fileURLToPath, URL } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
// 注意:Vite 8 native config loader 不支持配置内 import 本地模块/ __dirname,
// 因此代理规则内联在本文件。
export default defineConfig(({ command }) => ({
  // 构建产物部署在 nginx 的 /unifiedTodo 上下文下:资源引用统一加前缀;
  // 开发服务器仍保持根路径,不影响本地调试习惯
  base: command === 'build' ? '/unifiedTodo/' : '/',
  build: {
    // 产物目录与服务器部署目录同名(nginx alias /www/server/poc/web/todoweb):
    // 每次构建自动清空,打包后整目录替换服务器内容即可
    outDir: 'todoweb',
  },
  // svgr:把 *.svg?react 转成 React 组件,尺寸走 1em、颜色走 currentColor,
  // 因此图标着色/缩放全部由 CSS 控制(选中态变蓝只需改 color),无需再依赖图标字体。
  plugins: [react(), svgr({ svgrOptions: { icon: true } })],
  server: {
    host: '0.0.0.0',
    port: 3003,
    // 开发代理:后端网关 http://123.56.224.156:3001(与 portaloperationweb/setupProxy.js 同源)
    // - /platform/api/** → 网关原样路径(baseURL 已改为 /platform/api,对应参考实现的 /platform 前缀)
    // - /api/** → 网关 /platform/api/**(兼容旧 baseURL)
    proxy: {
      '/platform': {
        target: 'http://123.56.224.156:3001',
        changeOrigin: true,
        configure: (proxy) => {
          // 调试响应头:标记真实转发地址(同参考实现的 x-real-url)
          proxy.on('proxyRes', (proxyRes, req) => {
            const res = proxyRes as { headers: Record<string, string | string[] | undefined> }
            const reqUrl = (req as { url?: string }).url ?? ''
            res.headers['x-real-url'] = `http://123.56.224.156:3001${reqUrl}`
          })
        },
      },
      '/api': {
        target: 'http://123.56.224.156:3001/platform',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes, req) => {
            const res = proxyRes as { headers: Record<string, string | string[] | undefined> }
            const reqUrl = (req as { url?: string }).url ?? ''
            res.headers['x-real-url'] = `http://123.56.224.156:3001/platform${reqUrl}`
          })
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))
