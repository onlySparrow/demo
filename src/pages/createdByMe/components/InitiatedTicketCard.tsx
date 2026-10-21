import { BellOutlined, RollbackOutlined } from '@ant-design/icons'
import { Button, Space, Tag } from 'antd'

import type { InitiatedTicket } from '@/api/initiated'

import styles from './InitiatedTicketCard.module.scss'

export function InitiatedTicketCard({
  ticket,
  onUrge,
  onWithdraw,
}: {
  ticket: InitiatedTicket
  onUrge?: (id: string) => void
  onWithdraw?: (id: string) => void
}) {
  const getStatusColor = (status: InitiatedTicket['status']) => {
    switch (status) {
      case '处理中':
        return 'processing'
      case '待接单':
        return 'warning'
      case '已办结':
        return 'success'
      case '已撤回':
        return 'default'
      default:
        return 'default'
    }
  }

  const getUrgencyColor = (urgency: InitiatedTicket['urgency']) => {
    switch (urgency) {
      case '高':
        return 'error'
      case '中':
        return 'warning'
      case '低':
        return 'default'
      default:
        return 'default'
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.titleRow}>
        <span className={styles.title} title={ticket.title}>
          {ticket.title}
        </span>
        <Tag color={getStatusColor(ticket.status)} style={{ margin: 0, fontSize: 10 }}>
          {ticket.status}
        </Tag>
      </div>

      <div className={styles.metaRow}>
        <Tag color={getUrgencyColor(ticket.urgency)} style={{ margin: 0, fontSize: 10 }}>
          {ticket.urgency}
        </Tag>
        <span>派往: {ticket.targetDept}</span>
        <span className={styles.dot}>·</span>
        <span>发起: {ticket.initiateTime}</span>
      </div>

      {ticket.progress && (
        <div className={styles.progressBox}>
          <span>
            当前节点: <strong>{ticket.progress.currentNode}</strong>
          </span>
          <span className={styles.dot}>·</span>
          <span>处理人: {ticket.progress.currentPerson}</span>
        </div>
      )}

      <div className={styles.footer}>
        <span style={{ fontSize: 11, color: '#999' }}>{ticket.ticketNo}</span>
        <Space size={8}>
          {ticket.status === '处理中' && (
            <Button
              size="small"
              icon={<BellOutlined />}
              onClick={(e) => {
                e.stopPropagation()
                onUrge?.(ticket.id)
              }}
            >
              催办
            </Button>
          )}
          {(ticket.status === '处理中' || ticket.status === '待接单') && (
            <Button
              size="small"
              danger
              icon={<RollbackOutlined />}
              onClick={(e) => {
                e.stopPropagation()
                onWithdraw?.(ticket.id)
              }}
            >
              撤回
            </Button>
          )}
        </Space>
      </div>
    </div>
  )
}
