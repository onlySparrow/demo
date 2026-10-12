import { get } from '../utils/request'

export type PerformancePeriod = 'week' | 'month' | 'quarter' | 'year' | 'custom'

export interface KpiMetric {
  value: number
  change: number
  unit?: string
  target?: number
}

export interface PerformanceAlert {
  id: string
  metric: string
  current: string
  target: string
  deviation: number
  severity: 'warning' | 'info'
}

export interface MemberPerformance {
  name: string
  completed: number
  rate: number
  avgTime: number
  overtime: number
  radar: {
    volume: number
    quality: number
    speed: number
    response: number
    accuracy: number
  }
}

export interface PerformanceData {
  period: PerformancePeriod
  kpis: {
    totalCompleted: KpiMetric
    completeRate: KpiMetric
    avgDuration: KpiMetric
    todayRate: KpiMetric
    overtimeCount: KpiMetric
  }
  alerts: PerformanceAlert[]
  typeDistribution: Array<{ name: string; value: number }>
  trend: {
    labels: string[]
    personal: number[]
    orgAvg: number[]
  }
  durationHist: {
    labels: string[]
    values: number[]
  }
  members: MemberPerformance[]
}

/** 获取个人效能统计数据 */
export function fetchPerformanceData(
  period: PerformancePeriod = 'week',
  dateRange?: [string, string],
): Promise<PerformanceData> {
  return get<PerformanceData>('/performance/overview', { period, dateRange })
}
