import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons'
import { Card } from 'antd'
import type { ReactNode } from 'react'

import type { KpiMetric } from '@/api/performance'

/** 数值缺失时的占位符 */
const DASH = '-'

/**
 * KPI 指标卡 —— 标题行左侧为标题、右侧为主题色浅底圆角图标(对齐原型);
 * metric 缺失(接口无数据)时数值与环比展示「-」,不渲染环比箭头,卡片结构保持完整。
 * 底行两种形态(2026-10-15 新版指标卡):
 * - 传 hint:静态口径说明(灰字,如「已完成工单数 ÷ 工单总数 × 100%」);
 * - 不传:较上期环比行「较上期 ↑4.1% 环比(前序等长周期)」,箭头与百分数按升降着色。
 */
export function KpiCard({
  title,
  icon,
  iconColor,
  metric,
  unit,
  hint,
  valueColor,
}: {
  title: string
  /** 图标(原型为 Material Symbols,由页面传入并着色) */
  icon?: ReactNode
  /** 图标主题色 —— 决定右侧图标底色(同色 12% 调白) */
  iconColor?: string
  metric?: KpiMetric
  /** 单位覆盖(接口未下发 unit 时由页面指定,如 完成率 %、平均耗时 分钟) */
  unit?: string
  /** 静态口径说明(传入时替代环比行) */
  hint?: string
  /** 数值颜色(如 SLA 超时工单数用红色) */
  valueColor?: string
}) {
  const hasValue = metric && typeof metric.value === 'number'
  const hasChange = metric && typeof metric.change === 'number'
  const isUp = hasChange && (metric!.change as number) >= 0
  /** 展示单位:页面显式指定优先,其次取接口 unit */
  const displayUnit = unit ?? metric?.unit

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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
          color: '#666',
          fontSize: 12,
        }}
      >
        <span>{title}</span>
        {icon && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 30,
              height: 30,
              borderRadius: 8,
              color: iconColor,
              background: iconColor
                ? `color-mix(in srgb, ${iconColor} 12%, #fff)`
                : '#f0f2f5',
            }}
          >
            {icon}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: valueColor ?? '#1a1a1a',
            fontFamily: 'monospace',
          }}
        >
          {hasValue ? metric!.value : DASH}
        </span>
        {hasValue && displayUnit && (
          <span style={{ fontSize: 12, color: '#888' }}>{displayUnit}</span>
        )}
      </div>
      {hint ? (
        <div style={{ marginTop: 6, fontSize: 11, color: '#999' }}>{hint}</div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            marginTop: 6,
            fontSize: 11,
            color: '#999',
          }}
        >
          <span>较上期 </span>
          {hasChange && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                color: isUp ? '#2e7d32' : '#ba1a1a',
              }}
            >
              {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              {`${Math.abs(metric!.change as number)}%`}
            </span>
          )}
          {!hasChange && <span>{DASH}</span>}
          <span> 环比（前序等长周期）</span>
        </div>
      )}
    </Card>
  )
}
