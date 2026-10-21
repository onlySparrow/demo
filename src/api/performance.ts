import {
  exportPerformanceReport as mockExportPerformanceReport,
  fetchPerformanceData as mockFetchPerformanceData,
} from '../../mockApi/performanceMock'

/**
 * 个人效能模块接口层 —— 当前统一接入本地 mock 数据源（仓库根目录 `mockApi/performanceMock.ts`）。
 *
 * 页面与组件一律从 `@/api/performance` 引入，不感知数据来自真实接口还是 mock；
 * 数据按「地市运维中心」真实业务量级构造，各周期（本周/本月/本季度/年度）数值自洽。
 *
 * 切回真实接口：把下面每个函数的实现换回 `get` / `post` 调用即可
 * （函数名与入参签名保持不变，调用方零改动）。
 */

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
  /** @deprecated 五维雷达画像卡片已下线(2026-10-13),后端无需返回 */
  radar?: {
    volume: number
    quality: number
    speed: number
    response: number
    accuracy: number
  }
}

export interface PerformanceData {
  period: PerformancePeriod
  /** KPI 四项(2026-10-15 新版指标卡);今日即时办结率(todayRate)已下线,后端多余返回前端忽略 */
  kpis: {
    totalCompleted: KpiMetric
    completeRate: KpiMetric
    avgDuration: KpiMetric
    overtimeCount: KpiMetric
  }
  alerts: PerformanceAlert[]
  typeDistribution: Array<{ name: string; value: number }>
  /** @deprecated 处理量趋势对比卡片已下线(2026-10-13),后端无需返回 */
  trend?: {
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

/**
 * 获取个人效能统计数据
 *
 * 参数按后端契约平铺下发:
 * - 本周/本月/本季度/年度:`?period=week|month|quarter|year`
 * - 自定义:`?period=custom&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
 *   (非自定义周期不带日期)
 */
export function fetchPerformanceData(
  period: PerformancePeriod = 'week',
  dateRange?: [string, string],
): Promise<PerformanceData> {
  return mockFetchPerformanceData(period, dateRange)
}

/** 成员效能排行导出参数(筛选条件与效能总览一致) */
export interface ExportPerformanceParams {
  period: PerformancePeriod
  /** period=custom 时必传 YYYY-MM-DD */
  startDate?: string
  endDate?: string
  view?: 'personal' | 'manage'
  scope?: 'self' | 'team' | 'dept'
  /** 导出格式 —— 后端默认 csv,前端固定传 xlsx(否则 .xlsx 后缀里装的是 CSV 内容) */
  format?: 'csv' | 'xlsx'
}

/**
 * 导出成员效能排行(xlsx 文件流),mock 侧返回一个真实生成的 Blob。
 * 文件名取固定「成员效能排行.xlsx」。
 */
export function exportPerformanceReport(
  params: ExportPerformanceParams,
): Promise<Blob> {
  return mockExportPerformanceReport(params)
}
