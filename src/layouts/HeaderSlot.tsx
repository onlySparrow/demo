import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

/**
 * 顶栏插槽 —— 插槽式扩展点。
 *
 * 用法:页面在自己的渲染树里写
 *   <HeaderSlot><HeaderTabs options={...} /></HeaderSlot>
 * 或任意内容(一句话 / 按钮组 / 筛选器...),都会出现在顶栏标题右侧;
 * 页面卸载时内容自动移除,不在 BasicLayout 下的路由安全返回 null。
 */
const HeaderSlotContext = createContext<HTMLElement | null>(null)

export function HeaderSlot({ children }: { children: ReactNode }) {
  const container = useContext(HeaderSlotContext)

  if (!container) {
    return null
  }

  return createPortal(children, container)
}

/** 仅供 BasicLayout 提供容器 DOM 使用 */
export { HeaderSlotContext }
