import type { ReactNode } from 'react'

import styles from './TodoTicketCard.module.scss'

/** 待办工单卡片数据 —— TODO: 与统一待办服务接口模型对齐 */
export interface TodoTicket {
  id: string
  title: string
  /** 优先级:决定卡片左边条与优先级标签颜色 */
  priority: '高' | '中' | '低'
  /** 所属应用(来源系统) */
  app: string
  /** 派发时间 */
  time: string
  /** 处理人 */
  assignee?: string
}

/** 优先级 → 卡片左边条颜色 */
const PRIORITY_BORDER: Record<TodoTicket['priority'], string> = {
  高: styles.borderHigh,
  中: styles.borderMid,
  低: styles.borderLow,
}

/** 优先级 → 标签底色 */
const PRIORITY_BADGE: Record<TodoTicket['priority'], string> = {
  高: styles.badgeHigh,
  中: styles.badgeMid,
  低: styles.badgeLow,
}

/**
 * 待办工单卡片:优先级左边条 + 标题(前可带选择框) + 优先级标签 + 所属应用/时间/处理人。
 */
export function TodoTicketCard({ ticket, checkbox }: { ticket: TodoTicket; checkbox?: ReactNode }) {
  return (
    <div className={`${styles.card} ${PRIORITY_BORDER[ticket.priority]}`}>
      <div className={styles.titleRow}>
        {checkbox}
        <span className={styles.title} title={ticket.title}>
          {ticket.title}
        </span>
      </div>

      <div className={styles.metaRow}>
        <span className={`${styles.priority} ${PRIORITY_BADGE[ticket.priority]}`}>
          {ticket.priority}
        </span>
        <span>{ticket.app}</span>
        <span className={styles.dot}>·</span>
        <span>{ticket.time}</span>
        {ticket.assignee && (
          <>
            <span className={styles.dot}>·</span>
            <span>处理人: {ticket.assignee}</span>
          </>
        )}
      </div>
    </div>
  )
}
