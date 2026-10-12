import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons'
import { Card } from 'antd'

import type { KpiMetric } from '../../../api/performanceMock'

export function KpiCard({
  title,
  metric,
  subtitle,
}: {
  title: string
  metric: KpiMetric
  subtitle?: string
}) {
  const isUp = metric.change >= 0

  return (
    <Card
      size="small"
      style={{
        borderRadius: 8,
        border: '1px solid #c0c7d6',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      }}
      bodyStyle={{ padding: '12px 14px' }}
    >
      <div style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', fontFamily: 'monospace' }}>
          {metric.value}
        </span>
        {metric.unit && <span style={{ fontSize: 12, color: '#888' }}>{metric.unit}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
        <div style={{ fontSize: 11, color: isUp ? '#2e7d32' : '#ba1a1a', display: 'flex', alignItems: 'center', gap: 2 }}>
          {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          <span>{Math.abs(metric.change)}% 环比</span>
        </div>
        {subtitle && <div style={{ fontSize: 11, color: '#999' }}>{subtitle}</div>}
      </div>
    </Card>
  )
}
