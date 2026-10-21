import {
  createInitiatedOrder as mockCreateInitiatedOrder,
  fetchInitiatedOrders as mockFetchInitiatedOrders,
  urgeInitiatedOrder as mockUrgeInitiatedOrder,
  withdrawInitiatedOrder as mockWithdrawInitiatedOrder,
} from '../../mockApi/initiatedMock'

/**
 * 由我发起模块接口层 —— 当前统一接入本地 mock 数据源（仓库根目录 `mockApi/initiatedMock.ts`）。
 *
 * 页面与组件一律从 `@/api/initiated` 引入，不感知数据来自真实接口还是 mock；
 * 本地无后端即可跑通列表 / 催办 / 撤回 / 发起新工单。
 *
 * 切回真实接口：把下面每个函数的实现换回 `get` / `post` 调用即可
 * （函数名与入参签名保持不变，调用方零改动）。
 */

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
  return mockFetchInitiatedOrders(params)
}

/** 催办工单 */
export function urgeInitiatedOrder(id: string): Promise<{ success: boolean; message: string }> {
  return mockUrgeInitiatedOrder(id)
}

/** 撤回工单 */
export function withdrawInitiatedOrder(id: string): Promise<{ success: boolean; message: string }> {
  return mockWithdrawInitiatedOrder(id)
}

/** 发起新工单 */
export function createInitiatedOrder(data: Partial<InitiatedTicket>): Promise<InitiatedTicket> {
  return mockCreateInitiatedOrder(data)
}
