import type { TodoTicket } from '@/pages/todo/list-mode/components/TodoTicketCard'
import {
  batchProcessTodo as mockBatchProcessTodo,
  ensureDemoSubscriptionBuffer as mockEnsureDemoSubscriptionBuffer,
  fetchSubscriptionBuffer as mockFetchSubscriptionBuffer,
  fetchTodoDetail as mockFetchTodoDetail,
  fetchTodoList as mockFetchTodoList,
  fetchTransferAssignees as mockFetchTransferAssignees,
  fetchTransferQuickReplies as mockFetchTransferQuickReplies,
  removeSubscriptionBufferItem as mockRemoveSubscriptionBufferItem,
  subscribeBufferItem as mockSubscribeBufferItem,
  transferTodo as mockTransferTodo,
} from '../../mockApi/todoMock'

/**
 * 待办模块接口层 —— 当前统一接入本地 mock 数据源(仓库根目录 `mockApi/todoMock.ts`)。
 *
 * 页面与组件一律从 `@/api/todo` 引入,不感知数据来自真实接口还是 mock;
 * 本地无后端即可跑通列表 / 详情 / 转派 / 批量流转 / 订阅缓冲等全链路。
 *
 * 切回真实接口:把下面每个函数的实现换回 axios 调用即可(函数名与入参签名保持不变,
 * 调用方零改动)。
 */

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
  /** 工单来源系统（value 或中文 label） */
  source?: string
  /** 创建日期(年月日)筛选 YYYY-MM-DD —— 与列表卡片展示的创建时间为同一字段 */
  date?: string
  /** 是否启用智能排序（高优先级排前）—— 前端占位，真实逻辑待开发 */
  smartSort?: boolean
  /** 关键词检索（标题 / 来源） */
  keyword?: string
  /** 工单 id —— 深链 ?id= 带入,后端支持后按其过滤返回单个工单 */
  id?: string
}

/**
 * 待办工单列表返回响应
 */
export interface TodoListResult {
  /** 当前页列表数据 */
  list: TodoTicket[]
  /** 筛选条件下的总条数 */
  total: number
  /** 是否有更多数据（底部分页判断用） */
  hasMore?: boolean
}

/**
 * 获取待办工单列表接口
 *
 * 待办菜单下列表模式与地图模式共用本接口:
 * - 列表模式:直接渲染返回的列表数据;
 * - 地图模式:取同一份数据,按 lng/lat(百度 BD09)落点标注。
 */
export function fetchTodoList(params?: FetchTodoListParams): Promise<TodoListResult> {
  return mockFetchTodoList(params)
}

/**
 * 获取待办工单详情接口 —— 按工单 id 返回全量字段
 */
export function fetchTodoDetail(id: string): Promise<TodoTicket> {
  return mockFetchTodoDetail(id)
}

/** 转派工单请求参数 */
export interface TransferTodoParams {
  /** 工单 id */
  ticketId: string
  /** 转派对象 id(fetchTransferAssignees 返回) */
  assigneeId: string
  /** 转派说明 */
  remark?: string
}

/**
 * 工单转派 —— 成功后返回流转信息已更新的完整工单
 * (处理人变更 + 追加转派流转记录,前端拿返回值同步列表与详情)
 */
export function transferTodo(params: TransferTodoParams): Promise<TodoTicket> {
  return mockTransferTodo(params)
}

/** 批量审批(通过 / 驳回)请求参数 */
export interface BatchProcessTodoParams {
  /** 审批动作 */
  action: '通过' | '驳回'
  /** 本批次内的工单 id 集合 */
  ticketIds: string[]
  /** 审批意见 */
  comment: string
}

/**
 * 工单批量审批 —— 所选工单按批次完成流转(移出待办),返回实际处理数量
 */
export function batchProcessTodo(
  params: BatchProcessTodoParams,
): Promise<{ processed: number }> {
  return mockBatchProcessTodo(params)
}

/** 转派高频快捷回复项 */
export interface TransferQuickReply {
  id: string
  content: string
}

/** 转派对象（人员） */
export interface TransferAssignee {
  id: string
  name: string
  /** 部门 / 班组 */
  dept?: string
  phone?: string
}

/** 获取转派高频快捷回复 */
export function fetchTransferQuickReplies(): Promise<TransferQuickReply[]> {
  return mockFetchTransferQuickReplies()
}

/** 获取转派对象列表 */
export function fetchTransferAssignees(keyword?: string): Promise<TransferAssignee[]> {
  return mockFetchTransferAssignees(keyword)
}


/* —— 工单订阅缓冲区 —— */

export type SubscriptionCategory = 'alarm' | 'site' | 'cell' | 'history'

export interface SubscriptionBufferItem {
  id: string
  ticketId: string
  category: SubscriptionCategory
  tag: string
  title: string
  meta: string
  timeLabel: string
  createdAt: number
}

export interface SubscribeBufferParams {
  ticketId: string
  category: SubscriptionCategory
  tag: string
  title: string
  meta?: string
}

export function subscribeBufferItem(params: SubscribeBufferParams) {
  return mockSubscribeBufferItem(params)
}

export function fetchSubscriptionBuffer(params: { ticketId: string; tab?: string }) {
  return mockFetchSubscriptionBuffer(params)
}

export function removeSubscriptionBufferItem(id: string) {
  return mockRemoveSubscriptionBufferItem(id)
}

/** 首次为工单写入一批演示订阅项(本地 mock 存储,刷新页面即清空) */
export function ensureDemoSubscriptionBuffer(ticketId: string) {
  return mockEnsureDemoSubscriptionBuffer(ticketId)
}
