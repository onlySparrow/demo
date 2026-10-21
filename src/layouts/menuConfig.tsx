import type { ReactNode } from 'react'

import { DraftsIcon, InboxIcon, MonitoringIcon, PendingActionsIcon, SendIcon, TaskAltIcon, MarkEmailUnreadIcon } from '@/assets/icons'
import { routes } from '@/routes'

export interface MenuItemConfig {
  /** 路由地址,同时作为 Menu 的 key */
  key: string
  /** 菜单文案 */
  label: string
  /** 菜单图标(SVG 组件,颜色走 currentColor,尺寸走 font-size) */
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
  { key: routes.todo, label: '待办', icon: <PendingActionsIcon />, num: 12 },
  // 「待接单 / 待阅 / 由我发起」的 num 仅作接口失败时的兜底(启动时会用列表接口的 total 刷新)
  { key: routes.pendingOrder, label: '待接单', icon: <InboxIcon />, num: 5 },
  { key: routes.done, label: '已办', icon: <TaskAltIcon /> },
  {
    key: routes.unreadNotice,
    label: '待阅',
    icon: <MarkEmailUnreadIcon />,
    num: 5,
  },
  // 已阅是历史归档、个人效能是统计页,均无待处理语义,不设角标
  { key: routes.readNotice, label: '已阅', icon: <DraftsIcon /> },
  { key: routes.initiated, label: '由我发起', icon: <SendIcon />, num: 4 },
  { key: routes.performance, label: '个人效能', icon: <MonitoringIcon /> },
]
