import {
  acceptPendingOrder as mockAcceptPendingOrder,
  batchAcceptPendingOrders as mockBatchAcceptPendingOrders,
  fetchPendingOrders as mockFetchPendingOrders,
} from '../../mockApi/pendingOrderMock'

/**
 * 待接单模块接口层 —— 当前统一接入本地 mock 数据源（仓库根目录 `mockApi/pendingOrderMock.ts`）。
 *
 * 页面与组件一律从 `@/api/pendingOrder` 引入，不感知数据来自真实接口还是 mock；
 * 本地无后端即可跑通列表 / 单条接单 / 批量接单。
 *
 * 切回真实接口：把下面每个函数的实现换回 `get` / `post` 调用即可
 * （函数名与入参签名保持不变，调用方零改动）。
 */

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
  return mockFetchPendingOrders(params)
}

/** 立即接单 */
export function acceptPendingOrder(id: string): Promise<{ success: boolean; message: string }> {
  return mockAcceptPendingOrder(id)
}

/** 批量接单 */
export function batchAcceptPendingOrders(ids: string[]): Promise<{ success: boolean; count: number }> {
  return mockBatchAcceptPendingOrders(ids)
}
