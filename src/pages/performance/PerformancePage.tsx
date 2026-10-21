import { DatePicker, Radio, Spin } from 'antd'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import type { EChartsOption } from 'echarts'
import { useEffect, useState } from 'react'

import {
  fetchPerformanceData,
  type PerformanceData,
  type PerformancePeriod,
} from '@/api/performance'

import { AnalyticsIcon, TaskAltIcon, TimerIcon, WarningIcon } from '@/assets/icons'
import { EChartsCard } from './components/EChartsCard'
import { KpiCard } from './components/KpiCard'
import { MemberRankTable } from './components/MemberRankTable'
import { PERFORMANCE_PERIOD_OPTIONS } from './config'

import styles from './PerformancePage.module.scss'

export function PerformancePage() {
  const [period, setPeriod] = useState<PerformancePeriod>('week')
  /** 自定义时间区间(period=custom 时生效) */
  const [customRange, setCustomRange] = useState<[Dayjs | null, Dayjs | null]>([null, null])
  const [data, setData] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 自定义周期必须带起止日期(后端缺少 startDate/endDate 会返 400),
    // 区间被清空时先不请求,避免把上一次周期的数据误当成自定义结果
    if (period === 'custom' && !(customRange[0] && customRange[1])) {
      setLoading(false)
      return
    }
    setLoading(true)
    const dateRange =
      period === 'custom' && customRange[0] && customRange[1]
        ? ([
            customRange[0].format('YYYY-MM-DD'),
            customRange[1].format('YYYY-MM-DD'),
          ] as [string, string])
        : undefined
    // view / scope 随接口下发(见 doc/个人效能接口文档.md)
    fetchPerformanceData(period, dateRange)
      .then((res) => {
        setData(res)
      })
      .catch((err) => {
        console.error('[performance] 获取效能数据失败:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [period, customRange])

  if (!data && loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" tip="加载效能数据中..." />
      </div>
    )
  }

  // 接口无数据(data 为 null 或字段缺失)统一按空态渲染,页面框架保持完整:
  // KPI 数值/环比显「-」、预警无值显「-」、图表与表格居中「暂无数据」
  const kpis = data?.kpis
  const typeDistribution = data?.typeDistribution ?? []
  const durationHist = data?.durationHist ?? { labels: [], values: [] }
  const members = data?.members ?? []

  // 1. 饼图配置 (工单类型分布)
  const pieOption: EChartsOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c}单 ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'middle', textStyle: { fontSize: 11 } },
    color: ['#005daa', '#214ae2', '#4365fb', '#934600', '#2e7d32'],
    series: [
      {
        name: '工单类型',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 12, fontWeight: 'bold' } },
        data: typeDistribution,
      },
    ],
  }

  // 2. 时长分布柱状图配置 (处理时长分布)
  const histOption: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', top: 20, containLabel: true },
    xAxis: {
      type: 'category',
      // 后端标签为 <15min / 15-30min 等,展示层统一换成「分钟」
      data: durationHist.labels.map((label) => label.replace(/min/gi, '分钟')),
      axisLine: { lineStyle: { color: '#c0c7d6' } },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#e6e8eb' } },
    },
    series: [
      {
        name: '工单量',
        type: 'bar',
        data: durationHist.values,
        itemStyle: { color: '#005daa', borderRadius: [4, 4, 0, 0] },
      },
    ],
  }

  return (
    <div className={styles.container}>
      {/* 顶部:时间维度(+自定义区间紧随其后),固定个人视图 */}
      <div className={styles.headerBar}>
        <div className={styles.headerLeft}>
          <Radio.Group
            value={period}
            onChange={(e) => {
              const next = e.target.value as PerformancePeriod
              // 首次切到「自定义」:默认最近 7 天,保证立即带上 startDate/endDate 请求
              // (后端对无日期的 period=custom 返回 400,会导致页面停留在上一周期数据)
              if (next === 'custom' && !(customRange[0] && customRange[1])) {
                setCustomRange([dayjs().subtract(6, 'day'), dayjs()])
              }
              setPeriod(next)
            }}
            buttonStyle="solid"
            size="middle"
          >
            {PERFORMANCE_PERIOD_OPTIONS.map((opt) => (
              <Radio.Button key={opt.value} value={opt.value}>
                {opt.label}
              </Radio.Button>
            ))}
          </Radio.Group>

          {/* 自定义时间:紧跟「自定义」按钮之后 */}
          {period === 'custom' && (
            <DatePicker.RangePicker
              size="middle"
              value={customRange}
              onChange={(values) => setCustomRange([values?.[0] ?? null, values?.[1] ?? null])}
              placeholder={['开始日期', '结束日期']}
              allowClear
            />
          )}
        </div>
      </div>

      {/* 内容区:切换时间维度(调接口)时整块加载遮罩,请求结束在 finally 里关闭 */}
      <Spin spinning={loading} tip="加载效能数据中...">
        <div className={styles.contentBody}>
          {/* 4 个核心 KPI 卡片(2026-10-15 新版):完成总量带环比,其余三项带口径说明 */}
          <div className={styles.kpiGrid}>
        <KpiCard
          title="工单完成总量"
          icon={<TaskAltIcon style={{ fontSize: 16 }} />}
          iconColor="#005daa"
          metric={kpis?.totalCompleted}
        />
        <KpiCard
          title="工单完成率"
          icon={<AnalyticsIcon style={{ fontSize: 16 }} />}
          iconColor="#16a34a"
          metric={kpis?.completeRate}
          unit="%"
          hint="已完成工单数 ÷ 工单总数 × 100%"
        />
        <KpiCard
          title="平均处理耗时"
          icon={<TimerIcon style={{ fontSize: 16 }} />}
          iconColor="#934600"
          metric={kpis?.avgDuration}
          unit="分钟"
          hint="单件工单从受理到完成的平均耗时"
        />
        <KpiCard
          title="SLA 超时工单数"
          icon={<WarningIcon style={{ fontSize: 16 }} />}
          iconColor="#ba1a1a"
          metric={kpis?.overtimeCount}
          hint="超出 SLA 预定时限的工单数量"
          valueColor="#ba1a1a"
        />
      </div>

      {/* 图表行:工单类型分布 + 处理时长分布(无数据居中展示「暂无数据」) */}
      <div className={styles.chartGrid}>
        <EChartsCard
          title="工单类型分布"
          option={pieOption}
          height={260}
          empty={typeDistribution.length === 0}
        />
        <EChartsCard
          title="处理时长分布"
          option={histOption}
          height={260}
          empty={durationHist.values.length === 0}
        />
      </div>

      {/* 成员效能排行(最大高度滚动 + 表头固定,支持导出报表);view/scope 走接口默认(personal/dept) */}
      <MemberRankTable
        members={members}
        exportParams={{
          period,
          startDate: period === 'custom' ? customRange[0]?.format('YYYY-MM-DD') : undefined,
          endDate: period === 'custom' ? customRange[1]?.format('YYYY-MM-DD') : undefined,
        }}
      />
        </div>
      </Spin>
    </div>
  )
}
