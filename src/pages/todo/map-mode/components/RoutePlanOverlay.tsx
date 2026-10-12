import { CloseOutlined, CompassOutlined } from '@ant-design/icons'
import { Button, Tag } from 'antd'

import type { MapTodoTicket } from '../types'

import styles from '../index.module.scss'

export function RoutePlanOverlay({
  tickets,
  onClose,
}: {
  tickets: MapTodoTicket[]
  onClose: () => void
}) {
  const stops = tickets.slice(0, 5).map((t) => t.siteName)

  return (
    <div className={styles.routeOverlay}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#005daa', fontWeight: 700, fontSize: 13 }}>
          <CompassOutlined />
          <span>智能路径已生成</span>
        </div>
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={onClose}
          style={{ color: '#999' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#666' }}>预计总里程: 12.4 km</span>
          <Tag color="success" style={{ margin: 0, fontSize: 10 }}>
            路况顺畅
          </Tag>
        </div>

        <div style={{ color: '#555' }}>
          预计总时长: <strong>45 分钟</strong> | 覆盖 <strong>{tickets.length}</strong> 个工单点
        </div>

        <div
          style={{
            background: '#f4f7fb',
            borderRadius: 6,
            padding: '8px 10px',
            border: '1px solid #e2e8f0',
            fontSize: 11,
            color: '#475569',
          }}
        >
          <div style={{ fontWeight: 600, color: '#005daa', marginBottom: 4 }}>推荐巡检次序:</div>
          <div style={{ lineHeight: 1.5 }}>
            {stops.join(' → ')}
            {tickets.length > 5 ? ' → ...' : ''}
          </div>
        </div>

        <Button
          danger
          size="small"
          onClick={onClose}
          style={{ marginTop: 6 }}
        >
          取消路径规划
        </Button>
      </div>
    </div>
  )
}
