import type { FetchTodoListParams, TodoListResult, TodoTicket } from './todo'

export type { TodoTicket, FetchTodoListParams, TodoListResult }

/**
 * 待办工单模拟数据集（原型工单字段子集，共 12 条）
 */
export const mockTickets: TodoTicket[] = [
  {
    id: 'TODO-001',
    title: '【高铁督办工单】[衍生关联]LTE小区退出服务',
    priority: '高',
    app: '网络运营监控室',
    time: '2025-03-26 17:36',
    assignee: '张三',
  },
  {
    id: 'TODO-002',
    title: '基站电力中断报警 - 丽水中心枢纽',
    priority: '中',
    app: '动环监控系统',
    time: '2025-03-26 16:20',
    assignee: '李四',
  },
  {
    id: 'TODO-003',
    title: '资源勘察申请 - 丽水云和新区',
    priority: '低',
    app: '资源系统同步',
    time: '2025-03-26 15:10',
    assignee: '王五',
  },
  {
    id: 'TODO-004',
    title: '[告警] 核心网出口路由器链路震荡',
    priority: '高',
    app: '核心网监控',
    time: '2025-03-26 14:45',
    assignee: '赵六',
  },
  {
    id: 'TODO-005',
    title: '[客户投诉] 陆家嘴区域5G信号频繁掉线',
    priority: '中',
    app: '客户中心',
    time: '2025-03-26 14:12',
    assignee: '孙七',
  },
  {
    id: 'TODO-006',
    title: '[定期巡检] 虹桥火车站机房电力检查',
    priority: '低',
    app: '动环监控系统',
    time: '2025-03-26 13:30',
    assignee: '周八',
  },
  {
    id: 'TODO-007',
    title: '[建设任务] 丽水云和新区5G基站扩容',
    priority: '低',
    app: '建设部门',
    time: '2025-03-26 12:55',
    assignee: '吴九',
  },
  {
    id: 'TODO-008',
    title: '[紧急] 某核心机房空调故障',
    priority: '高',
    app: '动环监控系统',
    time: '2025-03-26 11:40',
    assignee: '郑十',
  },
  {
    id: 'TODO-009',
    title: '[告警] 城区汇聚层光缆中断',
    priority: '高',
    app: '传输网络部',
    time: '2025-03-26 10:32',
    assignee: '钱一',
  },
  {
    id: 'TODO-010',
    title: '[投诉] 宽带装机超时工单催办',
    priority: '中',
    app: '客户中心',
    time: '2025-03-26 09:58',
    assignee: '孙七',
  },
  {
    id: 'TODO-011',
    title: '[巡检] 季度蓄电池放电测试',
    priority: '低',
    app: '动环监控系统',
    time: '2025-03-25 17:20',
    assignee: '周八',
  },
  {
    id: 'TODO-012',
    title: '[优化] 高铁沿线切换参数调整',
    priority: '中',
    app: '无线优化中心',
    time: '2025-03-25 15:44',
    assignee: '李四',
  },
]

/**
 * 模拟获取待办工单列表接口
 * 函数名称、入参与返回值结构与 todo.ts 中的 fetchTodoList 严格保持一致，
 * 便于后期无缝切换为真实接口。
 */
export async function fetchTodoList(params?: FetchTodoListParams): Promise<TodoListResult> {
  // 模拟异步请求微小延迟
  await new Promise((resolve) => setTimeout(resolve, 60))

  let filtered = [...mockTickets]

  // 优先级筛选（兼容英文 key 和中文文案）
  if (params?.priority) {
    const priorityMap: Record<string, string> = {
      high: '高',
      mid: '中',
      low: '低',
      高: '高',
      中: '中',
      低: '低',
    }
    const target = priorityMap[params.priority] ?? params.priority
    filtered = filtered.filter((item) => item.priority === target)
  }

  // 关键词检索
  if (params?.keyword) {
    const kw = params.keyword.trim().toLowerCase()
    filtered = filtered.filter(
      (item) => item.title.toLowerCase().includes(kw) || item.app.toLowerCase().includes(kw),
    )
  }

  // 智能排序：高优先级排在前面
  if (params?.smartSort) {
    const weight: Record<string, number> = { 高: 3, 中: 2, 低: 1 }
    filtered.sort((a, b) => (weight[b.priority] || 0) - (weight[a.priority] || 0))
  }

  const total = filtered.length
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10

  // 分页截取
  const list = filtered.slice((page - 1) * pageSize, page * pageSize)
  const hasMore = page * pageSize < total

  return {
    list,
    total,
    hasMore,
  }
}
