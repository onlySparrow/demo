import type {
  KpiMetric,
  MemberPerformance,
  PerformanceAlert,
  PerformanceData,
  PerformancePeriod,
} from './performance'

export type {
  KpiMetric,
  PerformancePeriod,
  PerformanceData,
  PerformanceAlert,
  MemberPerformance,
}

const mockMembers: MemberPerformance[] = [
  {
    name: '张工 (你)',
    completed: 47,
    rate: 94.2,
    avgTime: 38,
    overtime: 6.4,
    radar: { volume: 85, quality: 92, speed: 78, response: 88, accuracy: 90 },
  },
  {
    name: '李四',
    completed: 58,
    rate: 96.5,
    avgTime: 32,
    overtime: 3.4,
    radar: { volume: 95, quality: 88, speed: 90, response: 82, accuracy: 85 },
  },
  {
    name: '赵六',
    completed: 52,
    rate: 91.0,
    avgTime: 41,
    overtime: 8.2,
    radar: { volume: 82, quality: 80, speed: 72, response: 90, accuracy: 78 },
  },
  {
    name: '孙七',
    completed: 45,
    rate: 88.5,
    avgTime: 50,
    overtime: 12.5,
    radar: { volume: 70, quality: 78, speed: 60, response: 85, accuracy: 75 },
  },
  {
    name: '周八',
    completed: 39,
    rate: 85.0,
    avgTime: 55,
    overtime: 15.0,
    radar: { volume: 60, quality: 75, speed: 55, response: 72, accuracy: 80 },
  },
  {
    name: '郑十',
    completed: 35,
    rate: 82.0,
    avgTime: 60,
    overtime: 18.0,
    radar: { volume: 52, quality: 70, speed: 50, response: 68, accuracy: 72 },
  },
]

export async function fetchPerformanceData(
  period: PerformancePeriod = 'week',
  dateRange?: [string, string],
): Promise<PerformanceData> {
  await new Promise((r) => setTimeout(r, 80))

  // 根据不同时间周期调整部分数值以模拟动态交互
  const multiplier =
    period === 'month' ? 4 : period === 'quarter' ? 12 : period === 'year' ? 48 : 1

  return {
    period,
    kpis: {
      totalCompleted: {
        value: Math.round(47 * multiplier),
        change: 12.5,
        unit: '单',
      },
      completeRate: {
        value: 94.2,
        change: -2.1,
        unit: '%',
        target: 95.0,
      },
      avgDuration: {
        value: 38,
        change: -8.5,
        unit: 'min',
        target: 30,
      },
      todayRate: {
        value: 87.5,
        change: 5.3,
        unit: '%',
      },
      overtimeCount: {
        value: Math.max(1, Math.round(3 * (multiplier > 1 ? multiplier * 0.7 : 1))),
        change: -15.2,
        unit: '单',
      },
    },
    alerts: [
      {
        id: 'alt-1',
        metric: '平均处理时长',
        current: '38min',
        target: '30min',
        deviation: 26.7,
        severity: 'warning',
      },
      {
        id: 'alt-2',
        metric: '按时办结率',
        current: '94.2%',
        target: '95.0%',
        deviation: -0.8,
        severity: 'info',
      },
    ],
    typeDistribution: [
      { name: '故障抢修', value: 18 * multiplier },
      { name: '投诉处理', value: 12 * multiplier },
      { name: '定期巡检', value: 8 * multiplier },
      { name: '建设扩容', value: 5 * multiplier },
      { name: '优化工单', value: 4 * multiplier },
    ],
    trend: {
      labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      personal: [8, 12, 9, 15, 10, 7, 5],
      orgAvg: [10, 11, 10, 12, 11, 9, 8],
    },
    durationHist: {
      labels: ['<15min', '15-30', '30-60', '1-2h', '2-4h', '>4h'],
      values: [5, 12, 18, 8, 3, 1],
    },
    members: mockMembers,
  }
}
