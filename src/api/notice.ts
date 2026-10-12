import { get, post } from '../utils/request'

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
  return get<NoticeResult>('/notice/unread/list', params)
}

/** 查询已阅通知 */
export function fetchReadNotices(params?: FetchNoticeParams): Promise<NoticeResult> {
  return get<NoticeResult>('/notice/read/list', params)
}

/** 标记单条通知已阅 */
export function markNoticeAsRead(id: string): Promise<{ success: boolean }> {
  return post<{ success: boolean }>('/notice/mark-read', { id })
}

/** 批量标记通知已阅 */
export function batchMarkNoticesAsRead(ids: string[]): Promise<{ success: boolean; count: number }> {
  return post<{ success: boolean; count: number }>('/notice/batch-mark-read', { ids })
}
