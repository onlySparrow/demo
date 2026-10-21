import { CloseOutlined, WarningOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useState } from 'react'

import type { PerformanceAlert } from '@/api/performance'

/** 预警值缺失时的占位符 */
const DASH = '-'

/** 预警条目值缺省展示(无数据时显示「-」) */
function deviationText(a: PerformanceAlert): string {
  return a.deviation == null ? DASH : `${a.deviation}%`
}

export function AlertBanner({ alerts }: { alerts?: PerformanceAlert[] }) {
  const [closedIds, setClosedIds] = useState<string[]>([])

  const activeAlerts = (alerts ?? []).filter((a) => !closedIds.includes(a.id))
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
                <strong>效能预警: {a.metric ?? DASH}</strong> —— 当前 {a.current ?? DASH}，目标{' '}
                {a.target ?? DASH}，偏离 {deviationText(a)}
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
