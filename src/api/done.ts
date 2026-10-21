import { fetchDoneOrders as mockFetchDoneOrders } from '../../mockApi/doneMock'

/**
 * 已办模块接口层 —— 当前统一接入本地 mock 数据源（仓库根目录 `mockApi/doneMock.ts`）。
 *
 * 页面与组件一律从 `@/api/done` 引入，不感知数据来自真实接口还是 mock；
 * 本地无后端即可跑通列表 / 筛选 / 分页。
 *
 * 切回真实接口：把下面函数的实现换回 `get('/order/done/list', params)` 即可
 * （函数名与入参签名保持不变，调用方零改动）。
 */

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
  return mockFetchDoneOrders(params)
}
