import { create } from 'zustand'

import { fetchMenuBadgeCounts } from '../api/menu'

/**
 * 菜单角标数量(按路由 key) —— 应用启动时拉取一次。
 * 接口失败/未返回的菜单,角标回落到 menuConfig 里声明的 num 初始值。
 */
interface MenuBadgeState {
  counts: Record<string, number>
  fetchMenuBadgeCounts: () => Promise<void>
}

export const useMenuBadgeStore = create<MenuBadgeState>((set) => ({
  counts: {},

  fetchMenuBadgeCounts: async () => {
    try {
      const counts = await fetchMenuBadgeCounts()
      set({ counts })
    } catch (error) {
      // 后端联调前 /api 不可用,保持 counts 为空由配置兜底;提示组件体系就位后接 message
      console.warn('[menu] 角标数量获取失败,回落配置初始值:', error)
    }
  },
}))
