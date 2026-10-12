import { DatePicker, Radio, Select, Space, Spin } from 'antd'
import type { EChartsOption } from 'echarts'
import { useEffect, useState } from 'react'

// 先引入 performanceMock.ts，待后端接口开发就绪后直接改为: import { fetchPerformanceData, type PerformanceData, type MemberPerformance, type PerformancePeriod } from '../../api/performance'
import {
  fetchPerformanceData,
  type MemberPerformance,
  type PerformanceData,
  type PerformancePeriod,
} from '../../api/performanceMock'

import { AlertBanner } from './components/AlertBanner'
import { EChartsCard } from './components/EChartsCard'
import { KpiCard } from './components/KpiCard'
import { MemberRankTable } from './components/MemberRankTable'
import { PERFORMANCE_PERIOD_OPTIONS } from './config'

import styles from './PerformancePage.module.scss'

export function PerformancePage() {
  const [period, setPeriod] = useState<PerformancePeriod>('week')
  const [data, setData] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedMember, setSelectedMember] = useState<MemberPerformance | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchPerformanceData(period)
      .then((res) => {
        setData(res)
        setSelectedMember(res.members[0] || null)
      })
      .catch((err) => {
        console.error('[performance] 获取效能数据失败:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [period])

  if (!data && loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" tip="加载效能数据中..." />
      </div>
    )
  }

  if (!data) return null

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
        data: data.typeDistribution,
      },
    ],
  }

  // 2. 趋势折线图配置 (个人完成量 vs 组织均值)
  const trendOption: EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: { top: 0, textStyle: { fontSize: 11 } },
    grid: { left: '3%', right: '4%', bottom: '3%', top: 32, containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.trend.labels,
      axisLine: { lineStyle: { color: '#c0c7d6' } },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#e6e8eb' } },
    },
    series: [
      {
        name: '个人完成量',
        type: 'line',
        smooth: true,
        data: data.trend.personal,
        itemStyle: { color: '#005daa' },
        areaStyle: { color: 'rgba(0, 93, 170, 0.08)' },
      },
      {
        name: '组织均值',
        type: 'line',
        smooth: true,
        data: data.trend.orgAvg,
        itemStyle: { color: '#934600' },
        lineStyle: { type: 'dashed' },
      },
    ],
  }

  // 3. 时长分布柱状图配置
  const histOption: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', top: 20, containLabel: true },
    xAxis: {
      type: 'category',
      data: data.durationHist.labels,
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
        data: data.durationHist.values,
        itemStyle: { color: '#005daa', borderRadius: [4, 4, 0, 0] },
      },
    ],
  }

  // 4. 雷达图配置
  const currentMember = selectedMember || data.members[0]
  const radarOption: EChartsOption = {
    tooltip: {},
    legend: { top: 0, textStyle: { fontSize: 11 } },
    radar: {
      indicator: [
        { name: '处理量', max: 100 },
        { name: '时效性', max: 100 },
        { name: '解决质量', max: 100 },
        { name: '响应速度', max: 100 },
        { name: '准确率', max: 100 },
      ],
      radius: '65%',
      splitArea: { areaStyle: { color: ['#fff', '#f9fafb'] } },
    },
    series: [
      {
        name: '能力画像',
        type: 'radar',
        data: [
          {
            value: [
              currentMember.radar.volume,
              currentMember.radar.speed,
              currentMember.radar.quality,
              currentMember.radar.response,
              currentMember.radar.accuracy,
            ],
            name: currentMember.name,
            itemStyle: { color: '#005daa' },
            areaStyle: { color: 'rgba(0, 93, 170, 0.2)' },
          },
          {
            value: [75, 72, 80, 78, 80],
            name: '组织均值',
            itemStyle: { color: '#c0c7d6' },
            lineStyle: { type: 'dashed' },
            areaStyle: { color: 'rgba(192, 199, 214, 0.1)' },
          },
        ],
      },
    ],
  }

  return (
    <div className={styles.container}>
      {/* 顶部时间维度与筛选 */}
      <div className={styles.headerBar}>
        <Radio.Group
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          buttonStyle="solid"
          size="middle"
        >
          {PERFORMANCE_PERIOD_OPTIONS.map((opt) => (
            <Radio.Button key={opt.value} value={opt.value}>
              {opt.label}
            </Radio.Button>
          ))}
        </Radio.Group>

        {period === 'custom' && (
          <Space>
            <DatePicker.RangePicker size="middle" placeholder={['开始日期', '结束日期']} />
          </Space>
        )}
      </div>

      {/* 效能预警通知栏 */}
      <AlertBanner alerts={data.alerts} />

      {/* 5 个核心 KPI 卡片 */}
      <div className={styles.kpiGrid}>
        <KpiCard title="累计完成工单" metric={data.kpis.totalCompleted} subtitle="个人工单池" />
        <KpiCard
          title="按时办结率"
          metric={data.kpis.completeRate}
          subtitle={`目标 ${data.kpis.completeRate.target}%`}
        />
        <KpiCard
          title="平均处理时效"
          metric={data.kpis.avgDuration}
          subtitle={`基准 ${data.kpis.avgDuration.target}min`}
        />
        <KpiCard title="今日即时办结率" metric={data.kpis.todayRate} subtitle="当日日结" />
        <KpiCard title="超时工单数" metric={data.kpis.overtimeCount} subtitle="逾期督办" />
      </div>

      {/* 图表第一行：工单类型分布 + 趋势对比 */}
      <div className={styles.chartGrid}>
        <EChartsCard title="工单类型分布占比" option={pieOption} height={260} />
        <EChartsCard title="处理量趋势对比 (个人 vs 组织均值)" option={trendOption} height={260} />
      </div>

      {/* 图表第二行：时长分布直方图 + 五维能力雷达图 */}
      <div className={styles.chartGrid}>
        <EChartsCard title="工单处理时长分布直方图" option={histOption} height={260} />
        <EChartsCard
          title="个人综合能力五维雷达画像"
          option={radarOption}
          height={260}
          extra={
            <Select
              size="small"
              value={currentMember.name}
              style={{ width: 130 }}
              onChange={(name) => {
                const target = data.members.find((m) => m.name === name)
                if (target) setSelectedMember(target)
              }}
              options={data.members.map((m) => ({ value: m.name, label: m.name }))}
            />
          }
        />
      </div>

      {/* 团队效能排名表 */}
      <MemberRankTable
        members={data.members}
        selectedMemberName={currentMember.name}
        onSelectMember={setSelectedMember}
      />
    </div>
  )
}
