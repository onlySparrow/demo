import { Button, Empty, Select } from 'antd'
import { useState } from 'react'
import type { Key } from 'react'

import { MaterialIcon } from '../../../components/MaterialIcon'
import { BaseList } from '../../../components/BaseList'

import { TodoTicketCard, type TodoTicket } from './components/TodoTicketCard'

import styles from './index.module.scss'

/**
 * 批量操作(演示) —— TODO: 接批量接口后替换,操作成功后清空选择并刷新列表。
 */
function handleBatch(action: string, keys: Key[]) {
  console.warn(`[todo] 批量${action}:`, keys)
}

/**
 * mock 数据(原型待办工单字段子集,凑 12 条以演示分页) ——
 * TODO: 接口就绪后替换为 useTodoList / fetchTodoList 返回数据。
 */
const mockTickets: TodoTicket[] = [
  {
    id: 'TODO-001',
    title: '【高铁督办工单】[衍生关联]LTE小区退出服务',
    priority: '高',
    app: '网络运营监控室',
    time: '2025-03-26 17:36',
    assignee: '张三',
  },
  {
    id: 'TODO-002',
    title: '基站电力中断报警 - 丽水中心枢纽',
    priority: '中',
    app: '动环监控系统',
    time: '2025-03-26 16:20',
    assignee: '李四',
  },
  {
    id: 'TODO-003',
    title: '资源勘察申请 - 丽水云和新区',
    priority: '低',
    app: '资源系统同步',
    time: '2025-03-26 15:10',
    assignee: '王五',
  },
  {
    id: 'TODO-004',
    title: '[告警] 核心网出口路由器链路震荡',
    priority: '高',
    app: '核心网监控',
    time: '2025-03-26 14:45',
    assignee: '赵六',
  },
  {
    id: 'TODO-005',
    title: '[客户投诉] 陆家嘴区域5G信号频繁掉线',
    priority: '中',
    app: '客户中心',
    time: '2025-03-26 14:12',
    assignee: '孙七',
  },
  {
    id: 'TODO-006',
    title: '[定期巡检] 虹桥火车站机房电力检查',
    priority: '低',
    app: '动环监控系统',
    time: '2025-03-26 13:30',
    assignee: '周八',
  },
  {
    id: 'TODO-007',
    title: '[建设任务] 丽水云和新区5G基站扩容',
    priority: '低',
    app: '建设部门',
    time: '2025-03-26 12:55',
    assignee: '吴九',
  },
  {
    id: 'TODO-008',
    title: '[紧急] 某核心机房空调故障',
    priority: '高',
    app: '动环监控系统',
    time: '2025-03-26 11:40',
    assignee: '郑十',
  },
  {
    id: 'TODO-009',
    title: '[告警] 城区汇聚层光缆中断',
    priority: '高',
    app: '传输网络部',
    time: '2025-03-26 10:32',
    assignee: '钱一',
  },
  {
    id: 'TODO-010',
    title: '[投诉] 宽带装机超时工单催办',
    priority: '中',
    app: '客户中心',
    time: '2025-03-26 09:58',
    assignee: '孙七',
  },
  {
    id: 'TODO-011',
    title: '[巡检] 季度蓄电池放电测试',
    priority: '低',
    app: '动环监控系统',
    time: '2025-03-25 17:20',
    assignee: '周八',
  },
  {
    id: 'TODO-012',
    title: '[优化] 高铁沿线切换参数调整',
    priority: '中',
    app: '无线优化中心',
    time: '2025-03-25 15:44',
    assignee: '李四',
  },
]

/** 演示用每页条数(BaseList 默认也是 10) */
const PAGE_SIZE = 10

/**
 * 待办 - 列表模式:左侧工单列表 + 右侧详情分栏。
 * TODO: 右侧接详情(micro-app 嵌入);列表数据接接口。
 */
export function TodoListMode() {
  const [loadedCount, setLoadedCount] = useState(PAGE_SIZE)
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([])
  const [smartSort, setSmartSort] = useState(false)

  const list = mockTickets.slice(0, loadedCount)
  const hasMore = loadedCount < mockTickets.length

  return (
    <div className={styles.layout}>
      <div className={styles.leftPanel}>
        <BaseList<TodoTicket>
          title="待办工单"
          titleExtra={<span>共 {mockTickets.length} 条</span>}
          filterSlot={
            <Select
              size="small"
              allowClear
              placeholder="紧急度"
              className={styles.filterSelect}
              options={[
                { value: 'high', label: '高' },
                { value: 'mid', label: '中' },
                { value: 'low', label: '低' },
              ]}
            />
          }
          toolbarSticky
          toolbarSlot={
            <Button
              size="small"
              type={smartSort ? 'primary' : 'default'}
              icon={<MaterialIcon name="sort" className={styles.sortIcon} />}
              onClick={() => setSmartSort((value) => !value)}
            >
              智能排序
            </Button>
          }
          dataSource={list}
          rowKey={(ticket) => ticket.id}
          renderItem={(ticket, { checkbox }) => <TodoTicketCard ticket={ticket} checkbox={checkbox} />}
          selectable
          selectedRowKeys={selectedKeys}
          onSelectedChange={setSelectedKeys}
          batchSlot={
            <>
              <Button size="small" type="primary" onClick={() => handleBatch('通过', selectedKeys)}>
                批量通过
              </Button>
              <Button size="small" danger onClick={() => handleBatch('驳回', selectedKeys)}>
                批量驳回
              </Button>
              <Button size="small" danger onClick={() => handleBatch('删除', selectedKeys)}>
                批量删除
              </Button>
            </>
          }
          pagination={{ total: mockTickets.length, pageSize: PAGE_SIZE, hasMore }}
          paginationMode="loadMore"
          onLoadMore={() => setLoadedCount((count) => Math.min(count + PAGE_SIZE, mockTickets.length))}
        />
      </div>

      <div className={styles.rightPanel}>
        <Empty description="请在左侧选择待办工单" />
      </div>
    </div>
  )
}
