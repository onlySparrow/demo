import type { TodoTicket } from '@/api/todo'

export interface MapTodoTicket extends TodoTicket {
  /** 经度 (百度坐标系 BD09) */
  lng: number
  /** 纬度 (百度坐标系 BD09) */
  lat: number
  /** 站点名称 */
  siteName: string
  /** 详细地址 */
  address: string
  /** 工单编号 */
  ticketNo?: string
  /** SLA 时效 */
  sla?: string
}
