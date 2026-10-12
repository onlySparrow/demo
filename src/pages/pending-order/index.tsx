import { Empty } from 'antd'
import { useState } from 'react'

import { BaseList } from '../../components/BaseList'

import { PendingOrderCard, type PendingOrderTicket } from './components/PendingOrderCard'

import styles from './index.module.scss'

/**
 * mock 数据(原型待接单工单字段子集) —— TODO: 接口就绪后替换。
 */
const mockTickets: PendingOrderTicket[] = [
  {
    id: 'PEND-001',
    title: '【网络告警】核心网出口路由器链路震荡',
    priority: '高',
    app: '核心网监控',
    time: '2025-03-26 14:45',
  },
  {
    id: 'PEND-002',
    title: '【客户投诉】陆家嘴区域5G信号频繁掉线',
    priority: '中',
    app: '客户中心',
    time: '2025-03-26 14:12',
  },
  {
    id: 'PEND-003',
    title: '【紧急】某核心机房空调故障 - 温度持续升高',
    priority: '高',
    app: '动环监控系统',
    time: '2025-03-26 11:40',
  },
  {
    id: 'PEND-004',
    title: '【建设任务】丽水云和新区5G基站扩容',
    priority: '低',
    app: '建设部门',
    time: '2025-03-26 12:55',
  },
  {
    id: 'PEND-005',
    title: '【定期巡检】虹桥火车站机房电力检查',
    priority: '低',
    app: '动环监控系统',
    time: '2025-03-26 13:30',
  },
]

/**
 * 待接单视图:左工单池列表(卡片带立即接单) + 右详情分栏。
 * 卡片差异通过 BaseList 的 renderItem 插槽实现,列表壳能力与待办完全一致。
 */
export function PendingOrderPage() {
  const [loadedCount, setLoadedCount] = useState(10)

  const list = mockTickets.slice(0, loadedCount)
  const hasMore = loadedCount < mockTickets.length

  return (
    <div className={styles.layout}>
      <div className={styles.leftPanel}>
        <BaseList<PendingOrderTicket>
          title="待接单工单"
          titleExtra={<span>共 {mockTickets.length} 条</span>}
          dataSource={list}
          rowKey={(ticket) => ticket.id}
          renderItem={(ticket, { checkbox }) => (
            <PendingOrderCard ticket={ticket} checkbox={checkbox} />
          )}
          pagination={{ total: mockTickets.length, hasMore }}
          paginationMode="loadMore"
          onLoadMore={() => setLoadedCount((count) => count + 10)}
        />
      </div>

      <div className={styles.rightPanel}>
        <Empty description="请在左侧选择待接单工单" />
      </div>
    </div>
  )
}
