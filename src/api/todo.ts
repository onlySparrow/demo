import { get } from '../utils/request'
import type { TodoTicket } from '../pages/todo/list-mode/components/TodoTicketCard'

export type { TodoTicket }

/**
 * 查询待办工单列表请求参数
 */
export interface FetchTodoListParams {
  /** 页码，从 1 开始 */
  page?: number
  /** 每页条数，默认 10 */
  pageSize?: number
  /** 优先级筛选（高 / 中 / 低 或 high / mid / low） */
  priority?: string
  /** 是否启用智能排序（高优先级排前） */
  smartSort?: boolean
  /** 关键词检索 */
  keyword?: string
}

/**
 * 待办工单列表返回响应
 */
export interface TodoListResult {
  /** 当前页列表数据 */
  list: TodoTicket[]
  /** 筛选条件下的总条数 */
  total: number
  /** 是否有更多数据（loadMore 模式分页） */
  hasMore?: boolean
}

/**
 * 获取待办工单列表接口
 * 后端服务就绪后接入此真实接口
 */
export function fetchTodoList(params?: FetchTodoListParams): Promise<TodoListResult> {
  return get<TodoListResult>('/todo/list', params)
}
