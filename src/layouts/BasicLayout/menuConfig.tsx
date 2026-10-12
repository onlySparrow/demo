import type { ReactNode } from 'react'

import { MaterialIcon } from '../../components/MaterialIcon'
import { routes } from '../../routes'

export interface MenuItemConfig {
  /** 路由地址,同时作为 Menu 的 key */
  key: string
  /** 菜单文案 */
  label: string
  /** 菜单图标(Material Symbols 图标名,与原型一致) */
  icon: ReactNode
  /**
   * 角标数量初始值 —— 应用启动时会调接口刷新(menuBadgeStore),
   * 接口失败或未返回该菜单时以此兜底。
   */
  num?: number
}

/**
 * 左侧菜单配置 —— 页面菜单在这里统一声明、由 Sidebar 遍历渲染。
 * 新增视图时在这里加一项,并在 pages/ 下同步建立对应文件夹与路由。
 *
 * 顶栏内容(tab / 文案等)不在这里声明:各页面通过 HeaderSlot 插槽自行决定。
 */
export const menuItems: MenuItemConfig[] = [
  { key: routes.todo, label: '待办', icon: <MaterialIcon name="pending_actions" />, num: 12 },
  { key: routes.pendingOrder, label: '待接单', icon: <MaterialIcon name="inbox" />, num: 5 },
  { key: routes.done, label: '已办', icon: <MaterialIcon name="task_alt" /> },
  {
    key: routes.unreadNotice,
    label: '待阅',
    icon: <MaterialIcon name="mark_email_unread" />,
    num: 8,
  },
  { key: routes.readNotice, label: '已阅', icon: <MaterialIcon name="drafts" /> },
  { key: routes.initiated, label: '由我发起', icon: <MaterialIcon name="send" />, num: 2 },
  { key: routes.performance, label: '个人效能', icon: <MaterialIcon name="monitoring" /> },
]
