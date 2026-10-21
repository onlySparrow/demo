import { Tag } from 'antd'
import type { ReactNode } from 'react'

import type { DoneTicket } from '@/api/done'

import styles from './DoneTicketCard.module.scss'

export function DoneTicketCard({
  ticket,
  checkbox,
}: {
  ticket: DoneTicket
  checkbox?: ReactNode
}) {
  const getResultColor = (result: DoneTicket['result']) => {
    switch (result) {
      case '已完成':
        return 'success'
      case '已归档':
        return 'default'
      case '已驳回':
        return 'error'
      case '已转派':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.titleRow}>
        {checkbox}
        <span className={styles.title} title={ticket.title}>
          {ticket.title}
        </span>
        <Tag color={getResultColor(ticket.result)} style={{ margin: 0, fontSize: 10 }}>
          {ticket.result}
        </Tag>
      </div>

      <div className={styles.metaRow}>
        <span>{ticket.source}</span>
        <span className={styles.dot}>·</span>
        <span>处理人: {ticket.assignee}</span>
        <span className={styles.dot}>·</span>
        <span>办结: {ticket.completeTime}</span>
      </div>

      {ticket.summary && (
        <div className={styles.summary} title={ticket.summary}>
          {ticket.summary}
        </div>
      )}
    </div>
  )
}
