import { CloseOutlined, WarningOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useState } from 'react'

import type { PerformanceAlert } from '../../../api/performanceMock'

export function AlertBanner({ alerts }: { alerts: PerformanceAlert[] }) {
  const [closedIds, setClosedIds] = useState<string[]>([])

  const activeAlerts = alerts.filter((a) => !closedIds.includes(a.id))
  if (activeAlerts.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {activeAlerts.map((a) => {
        const isWarn = a.severity === 'warning'
        return (
          <div
            key={a.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: 6,
              background: isWarn ? 'rgba(186, 26, 26, 0.05)' : 'rgba(0, 93, 170, 0.05)',
              border: `1px solid ${isWarn ? 'rgba(186, 26, 26, 0.2)' : 'rgba(0, 93, 170, 0.2)'}`,
              color: isWarn ? '#ba1a1a' : '#005daa',
              fontSize: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {isWarn ? <WarningOutlined /> : <InfoCircleOutlined />}
              <span>
                <strong>效能预警: {a.metric}</strong> —— 当前 {a.current}，目标 {a.target}，偏离 {a.deviation}%
              </span>
            </div>
            <button
              type="button"
              onClick={() => setClosedIds((prev) => [...prev, a.id])}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#999',
                padding: '2px',
              }}
            >
              <CloseOutlined style={{ fontSize: 11 }} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
