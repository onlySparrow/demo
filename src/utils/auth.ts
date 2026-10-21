/**
 * 认证 / 用户信息工具。
 *
 * 本系统无独立登录页 —— 用户从统一门户(portal)同域跳转进来:
 * - 用户信息由门户写入 localStorage(`portal_userData`,格式见 apps/pc/user.json);
 * - token 由门户写入 cookie(`portal_token`)
 * - 取不到用户信息,或接口返回 401 时,清理本地状态并跳回门户登录页。
 */

/** 统一门户登录页地址(401 / 无用户信息时跳回) */
export const LOGIN_URL = '/platform/#/login'

/** 门户用户信息的 localStorage 键名 */
export const PORTAL_USER_KEY = 'portal_userData'

/** token的键名 */
export const TOKEN_KEY = 'portal_token'


/** 门户用户信息(仅声明本系统用到的字段,完整格式见 apps/pc/user.json) */
export interface PortalUser {
  name?: string
  userName?: string
  orgName?: string
  userId?: string
  [key: string]: unknown
}

/** 读取门户用户信息;不存在或解析失败返回 null */
export function getUserData(): PortalUser | null {
  try {
    const raw = localStorage.getItem(PORTAL_USER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PortalUser
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

/** 清除门户用户信息 */
export function removeUserData(): void {
  localStorage.removeItem(PORTAL_USER_KEY)
}

/** 从 cookie 读取指定键的值;不传 key 默认读 token 键(TOKEN_KEY),不存在返回 null */
export function getCookie(key: string = TOKEN_KEY): string | null {
  for (const pair of document.cookie.split(';')) {
    const [name, ...rest] = pair.trim().split('=')
    if (name === key) {
      return decodeURIComponent(rest.join('='))
    }
  }
  return null
}

/** 清除 token(cookie + localStorage 兜底) */
export function removeToken(): void {
  // cookie 无法跨域清除,同域门户场景 path=/ 即可覆盖
  document.cookie = `${TOKEN_KEY}=; Max-Age=0; path=/`
}

/**
 * 跳回门户登录页(已在登录页时不再跳,防循环刷新)。
 * 本地开发(vite dev)不跳转,便于无门户环境调试。
 */
export function redirectToLogin(): void {
  if (import.meta.env.DEV) return
  if (window.location.hash.includes('login')) return
  window.location.href = LOGIN_URL
}

/** 会话失效统一处理:清 token + 用户信息,跳回登录页 */
export function handleUnauthorized(): void {
  // removeToken()
  // removeUserData()
  // redirectToLogin()
}
