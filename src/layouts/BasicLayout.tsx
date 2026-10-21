import { useEffect, useState } from 'react'
import { Outlet } from 'react-router'

import { useMenuBadgeStore } from '@/store/menuBadgeStore'

import { AppHeader } from './components/AppHeader'
import { AppSidebar } from './components/AppSidebar'
import { HeaderSlotContext } from './HeaderSlot'

import styles from './BasicLayout.module.scss'

/**
 * 应用主框架:左侧菜单(默认收起,悬停覆盖式展开),右侧上下结构(顶栏 + 内容区)。
 *
 * 顶栏标题右侧是插槽(HeaderSlot):各页面自行决定投什么内容,
 * 布局只负责把容器 DOM 通过 context 递给页面。
 */
export function BasicLayout() {
  const [slotElement, setSlotElement] = useState<HTMLDivElement | null>(null)
  const fetchMenuBadgeCounts = useMenuBadgeStore((state) => state.fetchMenuBadgeCounts)

  // 进系统初始化:拉取各菜单角标数量
  useEffect(() => {
    fetchMenuBadgeCounts()
  }, [fetchMenuBadgeCounts])

  return (
    <div className={styles.layout}>
      <AppSidebar />
      <div className={styles.main}>
        <AppHeader slotRef={setSlotElement} />
        <HeaderSlotContext value={slotElement}>
          <main className={styles.content}>
            <Outlet />
          </main>
        </HeaderSlotContext>
      </div>
    </div>
  )
}
