import { CloseOutlined } from '@ant-design/icons'
import { Button, Checkbox, Empty, Tooltip } from 'antd'
import { useState } from 'react'

import type { MapTodoTicket } from '../types'

import { MapTodoCard } from './MapTodoCard'

import styles from './MapTodoListPanel.module.scss'

/** 路线规划图标 SVG (还原图片中的路线流线造型) */
function RouteIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="6" cy="19" r="3" />
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
      <circle cx="18" cy="5" r="3" />
    </svg>
  )
}

const PAGE_SIZE = 5

export function MapTodoListPanel({
  tickets,
  selectedId,
  collapsed,
  checkedIds,
  onToggleCheck,
  onToggleCheckAll,
  onClose,
  onSelectTicket,
  onStartRoutePlan,
}: {
  tickets: MapTodoTicket[]
  selectedId: string | null
  collapsed: boolean
  checkedIds: string[]
  onToggleCheck: (id: string, checked: boolean) => void
  onToggleCheckAll: (checked: boolean) => void
  onClose: () => void
  onSelectTicket: (ticket: MapTodoTicket) => void
  onStartRoutePlan: (selectedTickets: MapTodoTicket[]) => void
}) {
  const [loadedCount, setLoadedCount] = useState<number>(PAGE_SIZE)

  const total = tickets.length
  const displayedTickets = tickets.slice(0, loadedCount)
  const hasMore = loadedCount < total
  const remainingCount = total - loadedCount

  // 全选状态
  const allChecked = total > 0 && tickets.every((t) => checkedIds.includes(t.id))
  const indeterminate =
    checkedIds.length > 0 && checkedIds.length < total && !allChecked

  const handleLoadMore = () => {
    setLoadedCount((prev) => prev + PAGE_SIZE)
  }

  const handlePlanClick = () => {
    if (checkedIds.length === 0) return
    const targets = tickets.filter((t) => checkedIds.includes(t.id))
    onStartRoutePlan(targets)
  }

  return (
    <div className={`${styles.panel} ${collapsed ? styles.collapsed : ''}`}>
      {/* 头部标题区：待办列表 (总数) + 关闭按钮 */}
      <div className={styles.header}>
        <span className={styles.title}>待办列表 ({total})</span>
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined style={{ fontSize: 14, color: '#64748b' }} />}
          onClick={onClose}
        />
      </div>

      {/* 顶部辅助操作栏：全选与已勾选计数 */}
      <div className={styles.subToolbar}>
        <Checkbox
          indeterminate={indeterminate}
          checked={allChecked}
          onChange={(e) => onToggleCheckAll(e.target.checked)}
        >
          全选所有工单
        </Checkbox>
        <span>
          已选择 <strong>{checkedIds.length}</strong> / {total} 项
        </span>
      </div>

      {/* 工单卡片列表区域 */}
      <div className={styles.listContainer}>
        {displayedTickets.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无符合条件的工单" />
        ) : (
          displayedTickets.map((ticket, idx) => (
            <MapTodoCard
              key={ticket.id}
              ticket={ticket}
              index={idx + 1}
              checked={checkedIds.includes(ticket.id)}
              selected={ticket.id === selectedId}
              onToggleCheck={onToggleCheck}
              onClick={() => onSelectTicket(ticket)}
            />
          ))
        )}

        {/* 分页下拉加载操作区 */}
        {hasMore && (
          <div className={styles.loadMoreBox}>
            <Button
              size="small"
              type="dashed"
              block
              onClick={handleLoadMore}
              style={{ color: '#005daa', borderColor: '#93c5fd' }}
            >
              点击加载更多 (剩余 {remainingCount} 条)
            </Button>
          </div>
        )}

        {!hasMore && total > PAGE_SIZE && (
          <div
            style={{
              textAlign: 'center',
              fontSize: 11,
              color: '#94a3b8',
              padding: '8px 0',
            }}
          >
            已加载全部 {total} 条待办工单
          </div>
        )}
      </div>

      {/* 底部按钮：一键智能路线规划（未勾选时置灰禁用） */}
      <div className={styles.footer}>
        <Tooltip
          title={
            checkedIds.length === 0 ? '请先在上方勾选需要规划巡检的待办工单' : undefined
          }
        >
          <Button
            type="primary"
            className={styles.planButton}
            icon={<RouteIcon />}
            disabled={checkedIds.length === 0}
            onClick={handlePlanClick}
          >
            一键智能路线规划
            {checkedIds.length > 0 ? ` (${checkedIds.length})` : ''}
          </Button>
        </Tooltip>
      </div>
    </div>
  )
}
