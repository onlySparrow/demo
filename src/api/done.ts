import { get } from '../utils/request'

export interface DoneTicket {
  id: string
  title: string
  source: string
  result: '已完成' | '已归档' | '已驳回' | '已转派'
  assignee: string
  completeTime: string
  ticketNo: string
  summary: string
  urgency?: '高' | '中' | '低'
}

export interface FetchDoneOrdersParams {
  page?: number
  pageSize?: number
  keyword?: string
  result?: string
  source?: string
  dateRange?: [string, string]
}

export interface DoneOrdersResult {
  list: DoneTicket[]
  total: number
  hasMore?: boolean
}

/** 查询已办工单列表 */
export function fetchDoneOrders(params?: FetchDoneOrdersParams): Promise<DoneOrdersResult> {
  return get<DoneOrdersResult>('/order/done/list', params)
}
