import { create } from 'zustand'

import { fetchDoneOrders } from '@/api/done'
import { fetchInitiatedOrders } from '@/api/initiated'
import { fetchPendingOrders } from '@/api/pendingOrder'
import { fetchTodoList } from '@/api/todo'
import { fetchUnreadNotices } from '@/api/notice'
import { routes } from '@/routes'

/**
 * 菜单角标数量(按路由 key) —— 应用启动时并行拉取一次。
 *
 * /menu/badge-counts 后端暂未开发:各菜单直接取对应列表接口返回的 total 字段,
 * 接口失败的菜单保持无数量、回落到 menuConfig 里声明的 num 初始值。
 *
 * 「已阅 / 个人效能」不设角标:已阅是历史归档,个人效能是统计页,均无待处理语义。
 */
interface MenuBadgeState {
  counts: Record<string, number>
  fetchMenuBadgeCounts: () => Promise<void>
}

/** 各菜单取 total 的接口(只取 total,pageSize 压到 1 减小载荷) */
type BadgeFetcher = () => Promise<{ total?: number }>

const TOTAL_FETCHERS: Array<[string, BadgeFetcher]> = [
  [routes.todo, () => fetchTodoList({ page: 1, pageSize: 1 })],
  [routes.pendingOrder, () => fetchPendingOrders({ page: 1, pageSize: 1 })],
  [routes.done, () => fetchDoneOrders({ page: 1, pageSize: 1 })],
  [routes.unreadNotice, () => fetchUnreadNotices({ page: 1, pageSize: 1 })],
  [routes.initiated, () => fetchInitiatedOrders({ page: 1, pageSize: 1 })],
]

export const useMenuBadgeStore = create<MenuBadgeState>((set) => ({
  counts: {},

  fetchMenuBadgeCounts: async () => {
    const results = await Promise.allSettled(TOTAL_FETCHERS.map(([, fetch]) => fetch()))

    const counts: Record<string, number> = {}
    results.forEach((result, index) => {
      if (result.status !== 'fulfilled') {
        // 单个接口失败不影响其余菜单角标,该菜单回落配置初始值
        console.warn(`[menu] ${TOTAL_FETCHERS[index][0]} 角标数量获取失败:`, result.reason)
        return
      }
      const total = result.value?.total
      if (typeof total === 'number') counts[TOTAL_FETCHERS[index][0]] = total
    })

    set({ counts })
  },
}))
