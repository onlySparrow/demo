import { CloseOutlined, UserOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import type { CSSProperties } from 'react'

import type { MapTodoTicket } from '../types'

import styles from '../index.module.scss'

export interface MapInfoWindowPosition {
  /** 相对地图容器的 left(px) */
  left: number
  /** 相对地图容器的 top(px) */
  top: number
}

/**
 * 地图标记气泡 —— 锚定在点击/悬停机房位置
 * compact：悬停轻量预览（无「查看工单详情」主按钮可保留简化）
 */
export function MapInfoWindow({
  ticket,
  position,
  onClose,
  onViewDetail,
  compact = false,
}: {
  ticket: MapTodoTicket
  position: MapInfoWindowPosition
  onClose: () => void
  onViewDetail: () => void
  compact?: boolean
}) {
  const deadline = ticket.deadline || ticket.sla || '--'

  const style: CSSProperties = {
    left: position.left,
    top: position.top,
    transform: 'translate(-50%, calc(-100% - 16px))',
  }

  return (
    <div
      className={`${styles.infoWindowCard} ${compact ? styles.infoWindowCompact : ''}`}
      style={style}
      onMouseEnter={(e) => e.stopPropagation()}
    >
      <div className={styles.infoWindowHeader}>
        <div className={styles.infoWindowTitleBlock}>
          <div className={styles.infoWindowTitle} title={ticket.title}>
            {ticket.title}
          </div>
          <div className={styles.infoWindowNo}>{ticket.ticketNo || ticket.id}</div>
        </div>
        {!compact && (
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={onClose}
            className={styles.infoWindowClose}
          />
        )}
      </div>

      <div className={styles.infoWindowBody}>
        <div className={styles.infoWindowPerson}>
          <UserOutlined className={styles.infoWindowPersonIcon} />
          <div>
            <div className={styles.infoWindowPersonLabel}>处理人</div>
            <div className={styles.infoWindowPersonName}>{ticket.assignee || '未分配'}</div>
          </div>
        </div>

        <div className={styles.infoWindowDeadline}>
          <span className={styles.infoWindowDeadlineLabel}>处理时限:</span>
          <span className={styles.infoWindowDeadlineValue}>{deadline}</span>
        </div>

        {!compact && (
          <Button type="primary" block size="large" onClick={onViewDetail}>
            查看工单详情
          </Button>
        )}
      </div>
    </div>
  )
}
