import * as echarts from 'echarts'
import { useEffect, useRef } from 'react'

export function EChartsCard({
  title,
  extra,
  option,
  height = 240,
}: {
  title: string
  extra?: React.ReactNode
  option: echarts.EChartsOption
  height?: number
}) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

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
  }, [option])

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
      <div ref={chartRef} style={{ width: '100%', height }} />
    </div>
  )
}
