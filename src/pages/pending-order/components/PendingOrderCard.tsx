import { Button } from 'antd'
import type { ReactNode } from 'react'

import styles from './PendingOrderCard.module.scss'

/** 待接单工单卡片数据 —— TODO: 与统一待办服务接口模型对齐 */
export interface PendingOrderTicket {
  id: string
  title: string
  /** 优先级:决定卡片左边条与标签颜色 */
  priority: '高' | '中' | '低'
  /** 所属应用(来源系统) */
  app: string
  /** 派发时间 */
  time: string
}

/** 立即接单 —— TODO: 接单接口,成功后从列表移除并刷新菜单角标 */
function handleAccept(id: string) {
  console.warn('[pending-order] 立即接单:', id)
}

/** 优先级 → 卡片左边条颜色 */
const PRIORITY_BORDER: Record<PendingOrderTicket['priority'], string> = {
  高: styles.borderHigh,
  中: styles.borderMid,
  低: styles.borderLow,
}

/** 优先级 → 标签底色 */
const PRIORITY_BADGE: Record<PendingOrderTicket['priority'], string> = {
  高: styles.badgeHigh,
  中: styles.badgeMid,
  低: styles.badgeLow,
}

/**
 * 待接单工单卡片:在待办卡片字段基础上增加"立即接单"操作区。
 */
export function PendingOrderCard({
  ticket,
  checkbox,
}: {
  ticket: PendingOrderTicket
  checkbox?: ReactNode
}) {
  return (
    <div className={`${styles.card} ${PRIORITY_BORDER[ticket.priority]}`}>
      <div className={styles.titleRow}>
        {checkbox}
        <span className={styles.title} title={ticket.title}>
          {ticket.title}
        </span>
      </div>

      <div className={styles.footer}>
        <div className={styles.metaRow}>
          <span className={`${styles.priority} ${PRIORITY_BADGE[ticket.priority]}`}>
            {ticket.priority}
          </span>
          <span>{ticket.app}</span>
          <span className={styles.dot}>·</span>
          <span>{ticket.time}</span>
        </div>

        <Button size="small" type="primary" onClick={() => handleAccept(ticket.id)}>
          立即接单
        </Button>
      </div>
    </div>
  )
}
