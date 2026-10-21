import { TicketDetail } from '../../components/TicketDetail'
import type { TodoTicket } from './TodoTicketCard'

import styles from './TodoDetailPanel.module.scss'

/**
 * 待办列表右侧详情面板 —— 右栏容器 + 共用详情内容(TicketDetail,
 * 列表/地图两模式同一套渲染;本模式展示站点缩略图)
 */
export function TodoDetailPanel({
  ticket,
  onTicketUpdate,
}: {
  ticket: TodoTicket
  /** 转派等操作成功后回传流转信息已更新的工单,由外层同步列表 */
  onTicketUpdate?: (ticket: TodoTicket) => void
}) {
  return (
    <div className={styles.panel}>
      <TicketDetail ticket={ticket} onTicketUpdate={onTicketUpdate} />
    </div>
  )
}
