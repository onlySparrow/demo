import { CloseOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Space, Tag, message } from 'antd'

import type { MapTodoTicket } from '../types'

import styles from '../index.module.scss'

export function MapInfoWindow({
  ticket,
  onClose,
}: {
  ticket: MapTodoTicket
  onClose: () => void
}) {
  const getUrgencyTag = (p: MapTodoTicket['priority']) => {
    switch (p) {
      case '高':
        return <Tag color="error">高紧急度</Tag>
      case '中':
        return <Tag color="warning">中紧急度</Tag>
      default:
        return <Tag color="processing">低紧急度</Tag>
    }
  }

  const handleAction = () => {
    message.success(`已定位并开启工单 ${ticket.id} 处理流程`)
  }

  return (
    <div className={styles.infoWindowCard}>
      <div className={styles.infoWindowHeader}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#333' }}>
            {ticket.ticketNo || ticket.id}
          </span>
          <span style={{ marginLeft: 8 }}>{getUrgencyTag(ticket.priority)}</span>
        </div>
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={onClose}
          style={{ color: '#999' }}
        />
      </div>

      <div className={styles.infoWindowBody}>
        <div style={{ fontWeight: 600, color: '#1a1a1a', fontSize: 13, lineHeight: 1.4 }}>
          {ticket.title}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#555' }}>
          <EnvironmentOutlined style={{ color: '#005daa' }} />
          <span>{ticket.siteName}</span>
        </div>

        <div style={{ color: '#777', fontSize: 11 }}>地址: {ticket.address}</div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', borderTop: '1px dashed #eee', paddingTop: 6 }}>
          <span>
            <UserOutlined style={{ marginRight: 4 }} />
            {ticket.assignee || '未分配'}
          </span>
          <span>来源: {ticket.app}</span>
        </div>

        {ticket.sla && (
          <div style={{ fontSize: 11, color: '#ba1a1a' }}>时限: {ticket.sla}</div>
        )}

        <Space style={{ marginTop: 4, width: '100%', justifyContent: 'flex-end' }}>
          <Button size="small" type="primary" onClick={handleAction}>
            立即处理
          </Button>
        </Space>
      </div>
    </div>
  )
}
