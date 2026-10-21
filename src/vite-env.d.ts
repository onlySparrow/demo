/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  /** 接口网关地址，如 /api 或 https://gw.example.com */
  readonly VITE_API_BASE_URL?: string
  /** 顶栏用户信息是否展示，默认展示；设为 false/0/off/no 隐藏 */
  readonly VITE_SHOW_USER_INFO?: string
  /** 待办 mock 数据总量（默认 10000）；设为 12 还原精简演示数据 */
  readonly VITE_MOCK_TODO_TOTAL?: string
}
