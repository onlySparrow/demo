import type { DoneOrdersResult, DoneTicket, FetchDoneOrdersParams } from '../src/api/done'

export type { DoneTicket, FetchDoneOrdersParams, DoneOrdersResult }

export const mockDoneTickets: DoneTicket[] = [
  {
    id: 'DONE-001',
    title: '【高铁督办工单】[衍生关联]LTE小区退出服务',
    source: '网络运营监控室',
    result: '已完成',
    assignee: '张三',
    completeTime: '2025-03-27 09:30',
    ticketNo: 'WO-20250326-0042',
    summary: '现场排查发现电源模块老化导致偶发性掉电，已更换PMU模块并恢复业务，复测信号正常。',
    urgency: '高',
  },
  {
    id: 'DONE-002',
    title: '基站电力中断报警 - 丽水中心枢纽',
    source: '动环监控系统',
    result: '已完成',
    assignee: '李四',
    completeTime: '2025-03-26 22:15',
    ticketNo: 'WO-20250326-0055',
    summary: '市电闪断导致UPS自动切换供电，已联系供电局确认电网波动已恢复。',
    urgency: '中',
  },
  {
    id: 'DONE-003',
    title: '[告警] 核心网出口路由器链路震荡',
    source: '核心网监控',
    result: '已转派',
    assignee: '赵六',
    completeTime: '2025-03-26 16:40',
    ticketNo: 'WO-20250326-0088',
    summary: '链路震荡原因为对端设备光模块故障，已转派至传输专业处理。',
    urgency: '高',
  },
  {
    id: 'DONE-004',
    title: '[客户投诉] 陆家嘴区域5G信号频繁掉线',
    source: '客户中心',
    result: '已驳回',
    assignee: '孙七',
    completeTime: '2025-03-26 15:50',
    ticketNo: 'WO-20250326-0091',
    summary: '经后台核查该区域5G基站指标正常，为用户终端兼容性问题，予以驳回。',
    urgency: '中',
  },
  {
    id: 'DONE-005',
    title: '[定期巡检] 虹桥火车站机房电力检查',
    source: '动环监控系统',
    result: '已归档',
    assignee: '周八',
    completeTime: '2025-03-26 14:20',
    ticketNo: 'WO-20250326-0098',
    summary: '季度例行机房环境与备用电源巡检完毕，各项电压指标正常。',
    urgency: '低',
  },
  {
    id: 'DONE-006',
    title: '[建设任务] 丽水云和新区5G基站扩容',
    source: '建设部门',
    result: '已完成',
    assignee: '吴九',
    completeTime: '2025-03-25 18:00',
    ticketNo: 'WO-20250325-0103',
    summary: '扩容板卡安装上线并通过验收测试，现网吞吐量提升约45%。',
    urgency: '低',
  },
]

export async function fetchDoneOrders(params?: FetchDoneOrdersParams): Promise<DoneOrdersResult> {
  await new Promise((r) => setTimeout(r, 60))

  let filtered = [...mockDoneTickets]

  if (params?.keyword) {
    const kw = params.keyword.trim().toLowerCase()
    filtered = filtered.filter(
      (t) => t.title.toLowerCase().includes(kw) || t.ticketNo.toLowerCase().includes(kw) || t.summary.toLowerCase().includes(kw),
    )
  }

  if (params?.result) {
    const resultMap: Record<string, string> = {
      completed: '已完成',
      archived: '已归档',
      transferred: '已转派',
      rejected: '已驳回',
    }
    const targetResult = resultMap[params.result] ?? params.result
    filtered = filtered.filter((t) => t.result === targetResult)
  }

  if (params?.source) {
    const sourceMap: Record<string, string> = {
      network_ops: '网络运营监控室',
      power_monitor: '动环监控系统',
      core_net: '核心网监控',
      customer_center: '客户中心',
      construction: '建设部门',
    }
    const targetSource = sourceMap[params.source] ?? params.source
    filtered = filtered.filter((t) => t.source === targetSource)
  }

  const total = filtered.length
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  const list = filtered.slice((page - 1) * pageSize, page * pageSize)
  const hasMore = page * pageSize < total

  return { list, total, hasMore }
}
