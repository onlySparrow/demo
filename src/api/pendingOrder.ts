import { get, post } from '../utils/request'

export interface PendingOrderTicket {
  id: string
  title: string
  priority: '高' | '中' | '低'
  app: string
  time: string
  assignee?: string
  ticketNo?: string
  deadline?: string
}

export interface FetchPendingOrdersParams {
  page?: number
  pageSize?: number
  keyword?: string
  app?: string
  priority?: string
}

export interface PendingOrdersResult {
  list: PendingOrderTicket[]
  total: number
  hasMore?: boolean
}

/** 查询待接单列表 */
export function fetchPendingOrders(params?: FetchPendingOrdersParams): Promise<PendingOrdersResult> {
  return get<PendingOrdersResult>('/order/pending/list', params)
}

/** 立即接单 */
export function acceptPendingOrder(id: string): Promise<{ success: boolean; message: string }> {
  return post<{ success: boolean; message: string }>('/order/pending/accept', { id })
}

/** 批量接单 */
export function batchAcceptPendingOrders(ids: string[]): Promise<{ success: boolean; count: number }> {
  return post<{ success: boolean; count: number }>('/order/pending/batch-accept', { ids })
}
