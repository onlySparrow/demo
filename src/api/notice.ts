import {
  batchMarkNoticesAsRead as mockBatchMarkNoticesAsRead,
  fetchReadNotices as mockFetchReadNotices,
  fetchUnreadNotices as mockFetchUnreadNotices,
  markNoticeAsRead as mockMarkNoticeAsRead,
} from '../../mockApi/noticeMock'

/**
 * 通知模块接口层 —— 当前统一接入本地 mock 数据源（仓库根目录 `mockApi/noticeMock.ts`）。
 *
 * 页面与组件一律从 `@/api/notice` 引入，不感知数据来自真实接口还是 mock；
 * 本地无后端即可跑通待阅 / 已阅列表与单条、批量已阅。
 *
 * 切回真实接口：把下面每个函数的实现换回 `get` / `post` 调用即可
 * （函数名与入参签名保持不变，调用方零改动）。
 */

export interface NoticeAttachment {
  name: string
  type: string
  size: string
  icon?: string
}

export interface NoticeItem {
  id: string
  title: string
  department: string
  publishTime: string
  category: string
  urgency: '重要' | '普通' | '紧急'
  summary: string
  isRead: boolean
  readTime?: string
  attachments?: NoticeAttachment[]
}

export interface FetchNoticeParams {
  page?: number
  pageSize?: number
  keyword?: string
  category?: string
  department?: string
  urgency?: string
}

export interface NoticeResult {
  list: NoticeItem[]
  total: number
  hasMore?: boolean
}

/** 查询待阅通知 */
export function fetchUnreadNotices(params?: FetchNoticeParams): Promise<NoticeResult> {
  return mockFetchUnreadNotices(params)
}

/** 查询已阅通知 */
export function fetchReadNotices(params?: FetchNoticeParams): Promise<NoticeResult> {
  return mockFetchReadNotices(params)
}

/** 标记单条通知已阅 */
export function markNoticeAsRead(id: string): Promise<{ success: boolean }> {
  return mockMarkNoticeAsRead(id)
}

/** 批量标记通知已阅 */
export function batchMarkNoticesAsRead(ids: string[]): Promise<{ success: boolean; count: number }> {
  return mockBatchMarkNoticesAsRead(ids)
}
