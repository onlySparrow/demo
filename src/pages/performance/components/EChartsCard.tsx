import * as echarts from 'echarts'
import { useEffect, useRef } from 'react'

/**
 * ECharts 图表卡片 —— empty 为 true 时(接口无数据)不初始化图表,
 * 居中展示「暂无数据」。
 */
export function EChartsCard({
  title,
  extra,
  option,
  height = 240,
  empty = false,
}: {
  title: string
  extra?: React.ReactNode
  option: echarts.EChartsOption
  height?: number
  /** 数据为空时居中展示「暂无数据」 */
  empty?: boolean
}) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (empty || !chartRef.current) return

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current)
    }

    chartInstance.current.setOption(option, true)

    const handleResize = () => {
      chartInstance.current?.resize()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      chartInstance.current?.dispose()
      chartInstance.current = null
    }
  }, [option, empty])

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 8,
        border: '1px solid #c0c7d6',
        padding: '14px 16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{title}</span>
        {extra}
      </div>
      {empty ? (
        <div
          style={{
            display: 'flex',
            height,
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            fontSize: 13,
          }}
        >
          暂无数据
        </div>
      ) : (
        <div ref={chartRef} style={{ width: '100%', height }} />
      )}
    </div>
  )
}
