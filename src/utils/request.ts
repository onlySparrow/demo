import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

import { getCookie, handleUnauthorized } from './auth'

/**
 * 统一 HTTP 请求封装。
 *
 * - baseURL 走 VITE_API_BASE_URL 环境变量，默认 /api（配合 vite proxy 或网关转发）
 * - 所有请求携带 cookie（withCredentials，跨域也生效）
 * - 请求拦截器自动附加 Bearer Token（优先取 cookie，localStorage 兜底）
 * - 响应拦截器统一解包 { code, message, data } 结构，异常统一转为 Error 抛出
 * - 401(HTTP 状态码或业务码)统一清 token/用户信息并跳回门户登录页(见 utils/auth.ts)
 */

/** 后端统一响应结构（与网关实际返回不一致时调整这里） */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/** 业务成功码 */
const SUCCESS_CODE = 200

/** 会话过期的业务码 */
const UNAUTHORIZED_CODE = 401

/** HTTP 状态码 → 用户可读的提示文案 */
const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: '请求参数错误',
  401: '登录状态已失效，请重新登录',
  403: '没有该操作的权限',
  404: '请求的资源不存在',
  408: '请求超时，请稍后重试',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务暂不可用',
  504: '网关超时',
}

const instance = axios.create({
  // 部署在 /unifiedTodo 上下文下时,BASE_URL 为 /unifiedTodo/ → 接口走 /unifiedTodo/api(nginx 同前缀代理);
  // 开发环境 BASE_URL 为 / → /api。特殊网关前缀用 VITE_API_BASE_URL 覆盖。
  baseURL: "/platform/api",
  timeout: 15_000,
  // Cookie 是浏览器禁止脚本手动设置的头,带上 cookie 数据的标准做法就是开此项:
  // 跨域时浏览器才会把 cookie 附到请求头(同源场景默认就会带)
  withCredentials: true,
})

// getCookie 已收敛到 utils/auth.ts 统一维护(与 token 键名 / 清理逻辑同处)

instance.interceptors.request.use((config) => {
  // token 优先取 cookie(统一认证写入);getCookie 不传 key 默认读 TOKEN_KEY
  const token = getCookie() ?? ''
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

instance.interceptors.response.use(
  (response) => {
    // 文件流（附件下载等）不做业务解包，原样返回
    if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
      return response.data as never
    }

    const res = response.data as Partial<ApiResponse> | null
    // 非标准结构（无 code 字段）直接透传，兼容第三方接口
    if (res && typeof res.code === 'number') {
      if (res.code === UNAUTHORIZED_CODE) {
        // 会话过期:清 token/用户信息并跳回门户登录页
        handleUnauthorized()
        return Promise.reject(new Error(res.message || '登录状态已失效，请重新登录'))
      }
      if (res.code !== SUCCESS_CODE) {
        return Promise.reject(new Error(res.message || `请求失败（code: ${res.code}）`))
      }
      return (res.data ?? null) as never
    }
    // 预期 JSON 却拿到字符串(典型:接口路径被 nginx try_files 回退成了 index.html):
    // 直接拒绝,让页面走既有错误分支(提示失败/空态),避免脏数据进入渲染层导致白屏
    if (typeof response.data === 'string') {
      return Promise.reject(
        new Error('接口返回异常（非 JSON），请检查服务地址与 nginx 接口代理配置'),
      )
    }
    return response.data as never
  },
  (error) => {
    // HTTP 401:会话过期,清 token/用户信息并跳回门户登录页
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      handleUnauthorized()
    }
    return Promise.reject(new Error(resolveErrorMessage(error)))
  },
)

/** 把各类异常（超时 / HTTP 状态码 / 网络错误）归一成可读文案 */
function resolveErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return '请求超时，请稍后重试'
    }
    const status = error.response?.status
    if (status && HTTP_STATUS_MESSAGES[status]) {
      return HTTP_STATUS_MESSAGES[status]
    }
    return error.message || '网络异常，请稍后重试'
  }
  return error instanceof Error ? error.message : '未知错误'
}

/** 核心请求方法：拦截器已解包，这里直接得到业务 data；axios 原生配置( headers / responseType 等 )原样透传 */
function request<T>(config: AxiosRequestConfig): Promise<T> {
  return instance.request<ApiResponse<T>>(config) as unknown as Promise<T>
}

/**
 * 快捷方法；不满足场景时直接用默认导出的 request(config)，例如：
 *
 *   // 查询(params 传参)
 *   request({ url: '/api/user/getThreeTree', method: 'get', params })
 *   // 提交
 *   request({ url: '/api/log/loginUserAnalysis', method: 'post', data })
 *   // 上传(multipart/form-data)
 *   request({ url: '/api/component/upload', method: 'post',
 *             headers: { 'Content-Type': 'multipart/form-data' }, data: formData })
 *   // 导出(文件流,拦截器对 blob 原样返回不解包)
 *   request<Blob>({ url: '/api/log/export', method: 'post', data, responseType: 'blob' })
 */
export const get = <T>(url: string, params?: object, config?: AxiosRequestConfig) =>
  request<T>({ url, method: 'get', params, ...config })

export const post = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  request<T>({ url, method: 'post', data, ...config })

export default request
