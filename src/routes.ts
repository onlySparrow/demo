import { buildDetailRoute } from '@unified-todo/shared'

/**
 * 应用路由地址表 —— 菜单配置(menuConfig)与路由树(router.tsx)共用的单一来源。
 * 独立成模块是为了避免 router ↔ menuConfig 循环引用。
 */
export const routes = {
  todo: '/todo',
  pendingOrder: '/pending-order',
  done: '/done',
  unreadNotice: '/unread-notice',
  readNotice: '/read-notice',
  initiated: '/initiated',
  performance: '/performance',
  /** 详情地址(全屏承载,不进主框架) */
  detail: (sourceKey: string, todoId: string) => buildDetailRoute(sourceKey, todoId),
} as const

export type AppRoutes = typeof routes
