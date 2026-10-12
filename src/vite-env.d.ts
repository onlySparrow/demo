/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 接口网关地址，如 /api 或 https://gw.example.com */
  readonly VITE_API_BASE_URL?: string
}
