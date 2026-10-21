import { Empty } from 'antd'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'

import type { TodoTicket } from '@/api/todo'
import { AssignmentIcon } from '@/assets/icons'
import { useMenuBadgeStore } from '@/store/menuBadgeStore'

import { TodoListPanel } from '../components/TodoListPanel'
// 智能工具箱整体注释隐藏(2026-10-14 需求),恢复时取消下行注释即可
// import { SmartToolbox } from '../components/SmartToolbox'
import { TodoDetailPanel } from './components/TodoDetailPanel'

import styles from './index.module.scss'

/**
 * 待办 - 列表模式:左侧工单列表(TodoListPanel 共用组件) + 右侧详情分栏。
 * 列表筛选/分页/批量通过驳回等能力都在 TodoListPanel 内,本页只管详情联动。
 */
export function TodoListMode() {
  const [searchParams] = useSearchParams()
  /** 深链工单:URL ?id=(或 ?ticketNo=) 带入的工单标识 */
  const focusId = searchParams.get('id') ?? searchParams.get('ticketNo')

  /** 面板列表数据镜像(onListChange 同步),用于右侧详情取数 */
  const [list, setList] = useState<TodoTicket[]>([])
  /** 当前点选查看的工单（卡片浅蓝高亮 + 右侧详情） */
  const [activeId, setActiveId] = useState<string | null>(null)
  /** 深链工单不在当前列表时,由面板详情接口拉到的兜底数据 */
  const [focusTicket, setFocusTicket] = useState<TodoTicket | null>(null)
  const activeTicket =
    list.find((t) => t.id === activeId) ??
    (focusTicket && focusTicket.id === activeId ? focusTicket : null)

  /** 转派等操作成功后递增,驱动列表面板重拉 */
  const [refreshSignal, setRefreshSignal] = useState(0)
  /** 菜单角标刷新(取 /todo/list 的 total) */
  const refreshMenuBadge = useMenuBadgeStore((state) => state.fetchMenuBadgeCounts)

  /**
   * 面板卡片点选:在列表内的直接展开详情;
   * 不在列表内的(深链详情兜底)记录为 focusTicket 供右侧展示。
   */
  const handleSelectTicket = (ticket: TodoTicket) => {
    setFocusTicket(list.some((t) => t.id === ticket.id) ? null : ticket)
    setActiveId(ticket.id)
  }

  // 列表数据变化(onListChange)可能晚于点选,这里统一兜底校正 focusTicket 归属
  useEffect(() => {
    if (!activeId) return
    const inList = list.some((t) => t.id === activeId)
    if (inList && focusTicket && focusTicket.id === activeId) {
      setFocusTicket(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list])

  // 筛选后若当前激活工单不在列表中，清空详情(深链兜底的独立详情除外)
  useEffect(() => {
    if (!activeId || list.length === 0) return
    if (list.some((t) => t.id === activeId)) return
    if (focusTicket && focusTicket.id === activeId) return
    setActiveId(null)
  }, [list, activeId, focusTicket])

  /** 转派等操作成功后:同步兜底详情数据,通知列表面板重拉并刷新菜单角标 */
  const handleTicketUpdate = (updated: TodoTicket) => {
    setFocusTicket((prev) => (prev && prev.id === updated.id ? updated : prev))
    setRefreshSignal((n) => n + 1)
    refreshMenuBadge()
  }

  return (
    <div className={styles.layout}>
      <div className={styles.leftPanel}>
        <TodoListPanel
          focusId={focusId}
          activeId={activeId}
          onSelectTicket={handleSelectTicket}
          onListChange={setList}
          refillDetail
          refreshSignal={refreshSignal}
        />
      </div>

      <div className={`${styles.rightPanel} ${activeTicket ? styles.rightPanelFilled : ''}`}>
        {activeTicket ? (
          <TodoDetailPanel ticket={activeTicket} onTicketUpdate={handleTicketUpdate} />
        ) : (
          <Empty
            image={<AssignmentIcon className={styles.emptyIcon} />}
            description="请在左侧选择待办工单"
          />
        )}
      </div>

      {/* 智能工具箱整体注释隐藏(2026-10-14 需求),恢复时取消注释即可
      <SmartToolbox
        mode="list"
        visible={Boolean(activeTicket)}
        ticketId={activeTicket?.id}
        ticketNo={activeTicket?.ticketNo}
        siteName={activeTicket?.siteName}
        ticketTitle={activeTicket?.title}
      />
      */}
    </div>
  )
}
