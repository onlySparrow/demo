import { Checkbox } from 'antd'

import { MaterialIcon } from '../../../../components/MaterialIcon'
import type { MapTodoTicket } from '../types'

import styles from './MapTodoCard.module.scss'

export function MapTodoCard({
  ticket,
  index,
  checked,
  selected,
  onToggleCheck,
  onClick,
}: {
  ticket: MapTodoTicket
  index: number
  checked: boolean
  selected: boolean
  onToggleCheck: (id: string, checked: boolean) => void
  onClick: () => void
}) {
  const getPriorityClasses = (priority: MapTodoTicket['priority']) => {
    switch (priority) {
      case '高':
        return {
          border: styles.borderHigh,
          bg: styles.bgHigh,
          badge: styles.badgeHigh,
        }
      case '中':
        return {
          border: styles.borderMid,
          bg: styles.bgMid,
          badge: styles.badgeMid,
        }
      default:
        return {
          border: styles.borderLow,
          bg: styles.bgLow,
          badge: styles.badgeLow,
        }
    }
  }

  const pClass = getPriorityClasses(ticket.priority)

  return (
    <div
      className={`${styles.card} ${pClass.border} ${selected ? styles.selected : ''}`}
      onClick={onClick}
    >
      {/* 绝对定位右上角复选框 */}
      <div
        className={styles.checkboxContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={checked}
          onChange={(e) => onToggleCheck(ticket.id, e.target.checked)}
        />
      </div>

      {/* 第一行：序号圆标 + 待办标题 */}
      <div className={styles.titleRow}>
        <div className={styles.title} title={ticket.title}>
          <span className={`${styles.indexBadge} ${pClass.bg}`}>{index}</span>
          <span>{ticket.title}</span>
        </div>
      </div>

      {/* 第二行：位置 (location_on 图标 + 站点名) */}
      <div className={styles.locationRow}>
        <MaterialIcon name="location_on" className={styles.locationIcon} />
        <span className={styles.locationText}>{ticket.siteName}</span>
      </div>

      {/* 第三行：待办人 (左) + 优先级标签 (右) */}
      <div className={styles.footerRow}>
        <span className={styles.assignee}>{ticket.assignee || '未分配'}</span>
        <span className={`${styles.urgencyBadge} ${pClass.badge}`}>
          {ticket.priority}
        </span>
      </div>
    </div>
  )
}
