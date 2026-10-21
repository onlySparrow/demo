import type {
  FetchInitiatedOrdersParams,
  InitiatedOrdersResult,
  InitiatedTicket,
} from '../src/api/initiated'

export type { InitiatedTicket, FetchInitiatedOrdersParams, InitiatedOrdersResult }

export let mockInitiatedTickets: InitiatedTicket[] = [
  {
    id: 'INIT-001',
    title: '丽水南站G502基站LTE小区退服故障上报',
    targetDept: '网络运营中心 - 丽水分部',
    status: '处理中',
    initiateTime: '2025-03-26 17:30',
    ticketNo: 'WO-20250326-0042',
    urgency: '高',
    summary: '监控发现丽水南站G502基站LTE小区退出服务，影响高铁沿线通信质量，请加急排查。',
    progress: {
      totalSteps: 5,
      currentStep: 3,
      currentNode: '现场处理排查',
      currentPerson: '张三 (13800138000)',
    },
  },
  {
    id: 'INIT-002',
    title: '市电中断抢修支援申请 - 丽水中心枢纽',
    targetDept: '动环抢修二队',
    status: '待接单',
    initiateTime: '2025-03-26 16:15',
    ticketNo: 'WO-20250326-0055',
    urgency: '中',
    summary: '市电偶发性闪断触发备用UPS告警，申请专业动环工程师到场协同核查配电柜状态。',
    progress: {
      totalSteps: 4,
      currentStep: 1,
      currentNode: '工单待接单池',
      currentPerson: '待分配',
    },
  },
  {
    id: 'INIT-003',
    title: '云和新区规划站基站资源勘察协调单',
    targetDept: '资源规划与建设中心',
    status: '已办结',
    initiateTime: '2025-03-24 10:00',
    ticketNo: 'WO-20250324-0019',
    urgency: '低',
    summary: '协调规划选址点现场勘验及供电走线可行性评审，已完成勘验报告签字归档。',
    progress: {
      totalSteps: 4,
      currentStep: 4,
      currentNode: '流程闭环归档',
      currentPerson: '王五 (归档员)',
    },
  },
  {
    id: 'INIT-004',
    title: '核心机房温湿度传感器校准工单',
    targetDept: '动环监控运维中心',
    status: '已撤回',
    initiateTime: '2025-03-23 14:00',
    ticketNo: 'WO-20250323-0082',
    urgency: '低',
    summary: '原申报传感器数值漂移，经现场二次比对后确认为临时气流扰动，数据恢复正常故撤回申请。',
  },
]

export async function fetchInitiatedOrders(params?: FetchInitiatedOrdersParams): Promise<InitiatedOrdersResult> {
  await new Promise((r) => setTimeout(r, 60))
  let filtered = [...mockInitiatedTickets]

  if (params?.keyword) {
    const kw = params.keyword.trim().toLowerCase()
    filtered = filtered.filter(
      (t) => t.title.toLowerCase().includes(kw) || t.ticketNo.toLowerCase().includes(kw) || t.targetDept.toLowerCase().includes(kw),
    )
  }

  if (params?.status) {
    const statusMap: Record<string, string> = {
      processing: '处理中',
      pending: '待接单',
      completed: '已办结',
      withdrawn: '已撤回',
    }
    const targetStatus = statusMap[params.status] ?? params.status
    filtered = filtered.filter((t) => t.status === targetStatus)
  }

  if (params?.urgency) {
    const urgencyMap: Record<string, string> = {
      high: '高',
      mid: '中',
      low: '低',
    }
    const targetUrgency = urgencyMap[params.urgency] ?? params.urgency
    filtered = filtered.filter((t) => t.urgency === targetUrgency)
  }

  const total = filtered.length
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  const list = filtered.slice((page - 1) * pageSize, page * pageSize)
  const hasMore = page * pageSize < total

  return { list, total, hasMore }
}

export async function urgeInitiatedOrder(id: string): Promise<{ success: boolean; message: string }> {
  await new Promise((r) => setTimeout(r, 120))
  return { success: true, message: `已成功向当前处理人发送工单 ${id} 催办通知` }
}

export async function withdrawInitiatedOrder(id: string): Promise<{ success: boolean; message: string }> {
  await new Promise((r) => setTimeout(r, 120))
  mockInitiatedTickets = mockInitiatedTickets.map((t) =>
    t.id === id ? { ...t, status: '已撤回' as const } : t,
  )
  return { success: true, message: `工单 ${id} 已成功撤回` }
}

export async function createInitiatedOrder(data: Partial<InitiatedTicket>): Promise<InitiatedTicket> {
  await new Promise((r) => setTimeout(r, 200))
  const newId = `INIT-00${mockInitiatedTickets.length + 1}`
  const now = new Date()
  const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const newTicket: InitiatedTicket = {
    id: newId,
    title: data.title || '新建运维协调工单',
    targetDept: data.targetDept || '网络运营监控中心',
    status: '处理中',
    initiateTime: timeStr,
    ticketNo: `WO-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    urgency: data.urgency || '中',
    summary: data.summary || '自发运维协调需求，请相关部门跟进处理。',
    progress: {
      totalSteps: 4,
      currentStep: 1,
      currentNode: '工单初审分派',
      currentPerson: '系统自动路由',
    },
  }

  mockInitiatedTickets.unshift(newTicket)
  return newTicket
}
