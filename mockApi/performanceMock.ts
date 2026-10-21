/**
 * 个人效能演示数据源（mock）—— 2026-10-15 起效能页改走本文件（用户要求不接真实接口）：
 * 数据按「地市运维中心」真实业务量级构造，各周期(本周/本月/本季度/年度)数值自洽
 * （成员完成量之和 = 完成总量；类型分布/时长分布之和 = 完成总量），当前登录人取
 * portal_userData 的姓名并在排行榜中标注「(你)」。函数签名与 @/api/performance 一致，
 * 后端数据就绪后把页面 import 切回 @/api/performance 即可。
 */
import dayjs from 'dayjs'

import { getUserData } from '@/utils/auth'

import type {
  ExportPerformanceParams,
  KpiMetric,
  MemberPerformance,
  PerformanceAlert,
  PerformanceData,
  PerformancePeriod,
} from '../src/api/performance'

export type {
  KpiMetric,
  PerformancePeriod,
  PerformanceData,
  PerformanceAlert,
  MemberPerformance,
  ExportPerformanceParams,
}

/* —— 基准数据(以「本周」为 1 倍基准,其余周期按倍率缩放) —— */

/** 本周完成总量(成员完成量之和与此一致) */
const WEEK_TOTAL = 486

/**
 * 本周成员效能排行(按完成量倒序):
 * 姓名/完成量/完成率(%)/平均时长(min)/超时率(%) —— 量级与全网运维中心周报同口径。
 * 第 5 位为当前登录人占位(name 运行时替换为门户姓名)。
 */
const WEEK_MEMBERS: MemberPerformance[] = [
  { name: '王志强', completed: 68, rate: 92.6, avgTime: 28, overtime: 4.4 },
  { name: '李海峰', completed: 62, rate: 90.3, avgTime: 31, overtime: 6.5 },
  { name: '张伟', completed: 55, rate: 94.5, avgTime: 26, overtime: 3.6 },
  { name: '陈晓东', completed: 50, rate: 88.0, avgTime: 35, overtime: 8.0 },
  { name: '@self', completed: 47, rate: 91.5, avgTime: 33, overtime: 6.4 },
  { name: '刘洋', completed: 44, rate: 86.4, avgTime: 40, overtime: 11.4 },
  { name: '周建华', completed: 41, rate: 89.0, avgTime: 37, overtime: 9.8 },
  { name: '吴建国', completed: 38, rate: 84.2, avgTime: 45, overtime: 13.2 },
  { name: '郑晓峰', completed: 34, rate: 82.4, avgTime: 49, overtime: 15.2 },
  { name: '孙立新', completed: 28, rate: 78.6, avgTime: 55, overtime: 17.9 },
  { name: '钱伟', completed: 19, rate: 89.5, avgTime: 42, overtime: 10.5 },
]

/** 本周工单类型分布(合计 = WEEK_TOTAL) */
const WEEK_TYPE_DIST: Array<{ name: string; value: number }> = [
  { name: '故障抢修', value: 186 },
  { name: '客户投诉', value: 118 },
  { name: '定期巡检', value: 92 },
  { name: '网络优化', value: 52 },
  { name: '建设扩容', value: 38 },
]

/** 本周处理时长分布(合计 = WEEK_TOTAL) */
const WEEK_DURATION_HIST = {
  labels: ['<15min', '15-30min', '30-60min', '1-2h', '2-4h', '>4h'],
  values: [78, 152, 143, 76, 28, 9],
}

/** 各周期 KPI(口径真实:完成率 89%±,单件耗时 36-41min,超时占比约 8%)与成员缩放倍率 */
const PERIOD_CONFIG: Record<
  Exclude<PerformancePeriod, 'custom'>,
  {
    scale: number
    kpi: { total: number; totalChange: number; rate: number; rateChange: number; avg: number; avgChange: number; ot: number; otChange: number }
    /** 成员指标随周期的小幅漂移(长周期累积口径下完成率略降、耗时略升) */
    memberDelta: { rate: number; avg: number; overtime: number }
  }
> = {
  week: {
    scale: 1,
    kpi: { total: 486, totalChange: 6.8, rate: 91.2, rateChange: 0.8, avg: 36, avgChange: -4.2, ot: 42, otChange: -12.5 },
    memberDelta: { rate: 0, avg: 0, overtime: 0 },
  },
  month: {
    scale: 4.4,
    kpi: { total: 2136, totalChange: 4.2, rate: 90.5, rateChange: 0.3, avg: 38, avgChange: -2.6, ot: 168, otChange: -8.1 },
    memberDelta: { rate: -0.7, avg: 2, overtime: 0.6 },
  },
  quarter: {
    scale: 13,
    kpi: { total: 6310, totalChange: 9.1, rate: 89.8, rateChange: -0.5, avg: 40, avgChange: 1.2, ot: 512, otChange: -3.4 },
    memberDelta: { rate: -1.4, avg: 4, overtime: 1.1 },
  },
  year: {
    scale: 52,
    kpi: { total: 25640, totalChange: 11.3, rate: 90.1, rateChange: 0.6, avg: 41, avgChange: -1.8, ot: 1980, otChange: -5.2 },
    memberDelta: { rate: -1.1, avg: 5, overtime: 1.7 },
  },
}

/** 数字裁剪到区间并保留 1 位小数 */
function clampRound(value: number, min: number, max: number): number {
  return Math.round(Math.min(max, Math.max(min, value)) * 10) / 10
}

/** 按倍率缩放并把最后一项补差,保证合计与总量一致(分布类数据用) */
function scaleDistribution(items: Array<{ name: string; value: number }>, scale: number, total: number) {
  const scaled = items.map((item) => ({ ...item, value: Math.round(item.value * scale) }))
  if (scaled.length > 0) {
    const sum = scaled.reduce((acc, item) => acc + item.value, 0)
    scaled[scaled.length - 1].value += total - sum
  }
  return scaled
}

/**
 * 获取个人效能统计数据(模拟):
 * period 维度切换时,总量/分布按倍率缩放、完成率与耗时按长周期口径小幅漂移,模拟真实周报/月报/年报差异。
 */
export async function fetchPerformanceData(
  period: PerformancePeriod = 'week',
  dateRange?: [string, string],
): Promise<PerformanceData> {
  // 模拟真实接口耗时(400ms):切换时间维度时页面的加载遮罩可见
  await new Promise((r) => setTimeout(r, 400))

  // 自定义区间:按天数占一周的比例缩放(未选日期回退本周基准)
  let scale = 1
  let kpiConfig = PERIOD_CONFIG.week.kpi
  let memberDelta = PERIOD_CONFIG.week.memberDelta
  if (period === 'custom') {
    const days =
      dateRange?.[0] && dateRange?.[1] ? Math.max(1, dayjs(dateRange[1]).diff(dayjs(dateRange[0]), 'day') + 1) : 7
    scale = days / 7
    const total = Math.round(WEEK_TOTAL * scale)
    kpiConfig = { ...PERIOD_CONFIG.week.kpi, total }
  } else {
    scale = PERIOD_CONFIG[period].scale
    kpiConfig = PERIOD_CONFIG[period].kpi
    memberDelta = PERIOD_CONFIG[period].memberDelta
  }

  const total = kpiConfig.total

  // 当前登录人姓名(取门户数据,取不到回退默认名),在排行榜中标注 (你)
  const selfName = getUserData()?.name || '赵珍珍'

  // 成员:完成量按倍率缩放(总和补差归到首位),完成率/耗时/超时率按周期小幅漂移
  const members: MemberPerformance[] = WEEK_MEMBERS.map((member) => ({
    ...member,
    name: member.name === '@self' ? `${selfName} (你)` : member.name,
    completed: Math.round(member.completed * scale),
    rate: clampRound(member.rate + memberDelta.rate, 70, 98),
    avgTime: Math.round(Math.max(15, member.avgTime + memberDelta.avg)),
    overtime: clampRound(member.overtime + memberDelta.overtime, 0.5, 25),
  }))
  const memberSum = members.reduce((acc, member) => acc + member.completed, 0)
  members[0].completed += total - memberSum
  members.sort((a, b) => b.completed - a.completed)

  // 预警:口径说明型条目,当前值直取本周期 KPI,保持页面各卡片数值自洽
  const alerts: PerformanceAlert[] = [
    {
      id: 'alt-1',
      metric: '平均处理耗时',
      current: `${kpiConfig.avg}min`,
      target: '32min',
      deviation: Math.round(((kpiConfig.avg - 32) / 32) * 1000) / 10,
      severity: kpiConfig.avg > 32 ? 'warning' : 'info',
    },
    {
      id: 'alt-2',
      metric: 'SLA 超时工单数',
      current: `${kpiConfig.ot} 单`,
      target: `${Math.round(total * 0.05)} 单`,
      deviation: Math.round(((kpiConfig.ot - total * 0.05) / (total * 0.05)) * 1000) / 10,
      severity: 'warning',
    },
    {
      id: 'alt-3',
      metric: '工单完成率',
      current: `${kpiConfig.rate}%`,
      target: '92.0%',
      deviation: Math.round((kpiConfig.rate - 92) * 10) / 10,
      severity: 'info',
    },
  ]

  return {
    period,
    kpis: {
      totalCompleted: { value: total, change: kpiConfig.totalChange, unit: '单' },
      completeRate: { value: kpiConfig.rate, change: kpiConfig.rateChange, unit: '%', target: 92 },
      avgDuration: { value: kpiConfig.avg, change: kpiConfig.avgChange, unit: 'min', target: 32 },
      overtimeCount: { value: kpiConfig.ot, change: kpiConfig.otChange, unit: '单' },
    },
    alerts,
    typeDistribution: scaleDistribution(WEEK_TYPE_DIST, scale, total),
    durationHist: {
      labels: WEEK_DURATION_HIST.labels,
      values: scaleDistribution(
        WEEK_DURATION_HIST.values.map((value, i) => ({ name: WEEK_DURATION_HIST.labels[i], value })),
        scale,
        total,
      ).map((item) => item.value),
    },
    members,
  }
}

/**
 * 成员效能排行导出(模拟):按当前筛选条件生成本地 CSV(BOM 头,Excel 直接打开不乱码),
 * 真实接口为服务端 xlsx,文件名在组件侧区分(见 MemberRankTable)。
 */
export async function exportPerformanceReport(params: ExportPerformanceParams): Promise<Blob> {
  await new Promise((r) => setTimeout(r, 300))
  const dateRange =
    params.startDate && params.endDate
      ? ([params.startDate, params.endDate] as [string, string])
      : undefined
  const data = await fetchPerformanceData(params.period, dateRange)
  const header = '排名,成员,完成量,完成率,平均时长(min),超时率(%)'
  const rows = data.members.map(
    (member, index) =>
      `${index + 1},${member.name.replace(/\s*\(你\)$/, '')},${member.completed},${member.rate}%,${member.avgTime},${member.overtime}%`,
  )
  const csv = '\uFEFF' + [header, ...rows].join('\r\n')
  return new Blob([csv], { type: 'text/csv;charset=utf-8' })
}
