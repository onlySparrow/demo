import { Button } from 'antd'
import type { ReactNode } from 'react'

import type { PendingOrderTicket } from '@/api/pendingOrder'

import styles from './PendingOrderCard.module.scss'

export type { PendingOrderTicket }

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

export function PendingOrderCard({
  ticket,
  checkbox,
  onAccept,
  accepting,
}: {
  ticket: PendingOrderTicket
  checkbox?: ReactNode
  onAccept?: (id: string) => void
  accepting?: boolean
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
          {ticket.deadline && (
            <>
              <span className={styles.dot}>·</span>
              <span style={{ color: '#ba1a1a', fontSize: 11 }}>{ticket.deadline}</span>
            </>
          )}
        </div>

        <Button
          size="small"
          type="primary"
          loading={accepting}
          onClick={(e) => {
            e.stopPropagation()
            onAccept?.(ticket.id)
          }}
        >
          立即接单
        </Button>
      </div>
    </div>
  )
}
