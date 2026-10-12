import type {
  FetchPendingOrdersParams,
  PendingOrdersResult,
  PendingOrderTicket,
} from './pendingOrder'

export type { PendingOrderTicket, FetchPendingOrdersParams, PendingOrdersResult }

export let mockPendingTickets: PendingOrderTicket[] = [
  {
    id: 'PEND-001',
    title: '【网络告警】核心网出口路由器链路震荡',
    priority: '高',
    app: '核心网监控',
    time: '2025-03-26 14:45',
    assignee: '赵六',
    ticketNo: 'WO-20250326-0088',
    deadline: '2025-03-26 20:00 (剩 5h)',
  },
  {
    id: 'PEND-002',
    title: '【客户投诉】陆家嘴区域5G信号频繁掉线',
    priority: '中',
    app: '客户中心',
    time: '2025-03-26 14:12',
    assignee: '孙七',
    ticketNo: 'WO-20250326-0091',
    deadline: '2025-03-27 08:00 (剩 17h)',
  },
  {
    id: 'PEND-003',
    title: '【紧急】某核心机房空调故障 - 温度持续升高',
    priority: '高',
    app: '动环监控系统',
    time: '2025-03-26 11:40',
    assignee: '郑十',
    ticketNo: 'WO-20250326-0105',
    deadline: '2025-03-26 15:00 (剩 3h)',
  },
  {
    id: 'PEND-004',
    title: '【建设任务】丽水云和新区5G基站扩容',
    priority: '低',
    app: '建设部门',
    time: '2025-03-26 12:55',
    assignee: '吴九',
    ticketNo: 'WO-20250326-0112',
    deadline: '2025-03-28 12:00 (剩 43h)',
  },
  {
    id: 'PEND-005',
    title: '【定期巡检】虹桥火车站机房电力检查',
    priority: '低',
    app: '动环监控系统',
    time: '2025-03-26 13:30',
    assignee: '周八',
    ticketNo: 'WO-20250326-0098',
    deadline: '2025-03-28 18:00 (剩 49h)',
  },
]

export async function fetchPendingOrders(params?: FetchPendingOrdersParams): Promise<PendingOrdersResult> {
  await new Promise((r) => setTimeout(r, 60))

  let filtered = [...mockPendingTickets]

  if (params?.keyword) {
    const kw = params.keyword.trim().toLowerCase()
    filtered = filtered.filter(
      (t) => t.title.toLowerCase().includes(kw) || t.app.toLowerCase().includes(kw),
    )
  }

  if (params?.app) {
    const appMap: Record<string, string> = {
      core_net: '核心网监控',
      customer_center: '客户中心',
      power_monitor: '动环监控系统',
      construction: '建设部门',
    }
    const targetApp = appMap[params.app] ?? params.app
    filtered = filtered.filter((t) => t.app === targetApp)
  }

  if (params?.priority) {
    const priorityMap: Record<string, string> = {
      high: '高',
      mid: '中',
      low: '低',
      高: '高',
      中: '中',
      低: '低',
    }
    const p = priorityMap[params.priority] ?? params.priority
    filtered = filtered.filter((t) => t.priority === p)
  }

  const total = filtered.length
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  const list = filtered.slice((page - 1) * pageSize, page * pageSize)
  const hasMore = page * pageSize < total

  return { list, total, hasMore }
}

export async function acceptPendingOrder(id: string): Promise<{ success: boolean; message: string }> {
  await new Promise((r) => setTimeout(r, 200))
  mockPendingTickets = mockPendingTickets.filter((t) => t.id !== id)
  return { success: true, message: `工单 ${id} 接单成功，已转入待办处理` }
}

export async function batchAcceptPendingOrders(ids: string[]): Promise<{ success: boolean; count: number }> {
  await new Promise((r) => setTimeout(r, 250))
  mockPendingTickets = mockPendingTickets.filter((t) => !ids.includes(t.id))
  return { success: true, count: ids.length }
}
