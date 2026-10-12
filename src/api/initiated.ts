import { get, post } from '../utils/request'

export interface InitiatedProgress {
  totalSteps: number
  currentStep: number
  currentNode: string
  currentPerson: string
}

export interface InitiatedTicket {
  id: string
  title: string
  targetDept: string
  status: '处理中' | '待接单' | '已办结' | '已撤回'
  initiateTime: string
  ticketNo: string
  urgency: '高' | '中' | '低'
  summary: string
  progress?: InitiatedProgress
}

export interface FetchInitiatedOrdersParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: string
  urgency?: string
}

export interface InitiatedOrdersResult {
  list: InitiatedTicket[]
  total: number
  hasMore?: boolean
}

/** 查询由我发起的工单列表 */
export function fetchInitiatedOrders(params?: FetchInitiatedOrdersParams): Promise<InitiatedOrdersResult> {
  return get<InitiatedOrdersResult>('/order/initiated/list', params)
}

/** 催办工单 */
export function urgeInitiatedOrder(id: string): Promise<{ success: boolean; message: string }> {
  return post<{ success: boolean; message: string }>('/order/initiated/urge', { id })
}

/** 撤回工单 */
export function withdrawInitiatedOrder(id: string): Promise<{ success: boolean; message: string }> {
  return post<{ success: boolean; message: string }>('/order/initiated/withdraw', { id })
}

/** 发起新工单 */
export function createInitiatedOrder(data: Partial<InitiatedTicket>): Promise<InitiatedTicket> {
  return post<InitiatedTicket>('/order/initiated/create', data)
}
