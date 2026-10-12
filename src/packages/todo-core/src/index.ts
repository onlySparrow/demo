/**
 * 待办核心数据模型与基础枚举
 */
export interface BaseTicket {
  id: string
  title: string
  priority: '高' | '中' | '低'
  app: string
  time: string
  assignee?: string
}
