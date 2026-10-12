import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { Button, Empty, Input, Select, Space, message } from 'antd'
import { useEffect, useState } from 'react'

import { BaseList } from '../../components/BaseList'
// 先引入 initiatedMock.ts，待后端接口开发就绪后直接改为: import { fetchInitiatedOrders, urgeInitiatedOrder, withdrawInitiatedOrder, type InitiatedTicket } from '../../api/initiated'
import {
  fetchInitiatedOrders,
  urgeInitiatedOrder,
  withdrawInitiatedOrder,
  type InitiatedTicket,
} from '../../api/initiatedMock'

import { CreateTicketModal } from './components/CreateTicketModal'
import { InitiatedTicketCard } from './components/InitiatedTicketCard'
import { INITIATED_STATUS_OPTIONS, INITIATED_URGENCY_OPTIONS } from './config'

import styles from './InitiatedPage.module.scss'

const PAGE_SIZE = 10

/**
 * 由我发起工单视图。
 */
export function InitiatedPage() {
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<InitiatedTicket[]>([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loadedCount, setLoadedCount] = useState(PAGE_SIZE)
  const [keyword, setKeyword] = useState<string>('')
  const [status, setStatus] = useState<string | undefined>(undefined)
  const [urgency, setUrgency] = useState<string | undefined>(undefined)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const loadData = () => {
    setLoading(true)
    fetchInitiatedOrders({
      page: 1,
      pageSize: loadedCount,
      keyword,
      status,
      urgency,
    })
      .then((res) => {
        setList(res.list)
        setTotal(res.total)
        setHasMore(Boolean(res.hasMore))
      })
      .catch((err) => {
        console.error('[initiated] 获取工单列表失败:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    loadData()
  }, [loadedCount, keyword, status, urgency])

  const handleUrge = async (id: string) => {
    try {
      const res = await urgeInitiatedOrder(id)
      message.success(res.message)
    } catch {
      message.error('催办失败')
    }
  }

  const handleWithdraw = async (id: string) => {
    try {
      const res = await withdrawInitiatedOrder(id)
      message.success(res.message)
      loadData()
    } catch {
      message.error('撤回失败')
    }
  }

  return (
    <div className={styles.layout}>
      <div className={styles.leftPanel}>
        <BaseList<InitiatedTicket>
          title="由我发起"
          titleExtra={<span>共 {total} 条</span>}
          loading={loading}
          filterSlot={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <Input.Search
                  size="small"
                  placeholder="请输入工单标题/编号/部门"
                  allowClear
                  onSearch={(val) => {
                    setKeyword(val)
                    setLoadedCount(PAGE_SIZE)
                  }}
                  style={{ flex: 1 }}
                />
                <Button size="small" icon={<ReloadOutlined />} onClick={loadData} title="刷新" />
                <Button
                  size="small"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateModalOpen(true)}
                >
                  新建
                </Button>
              </div>
              <Space wrap size={8}>
                <Select
                  size="small"
                  allowClear
                  placeholder="状态"
                  style={{ width: 110 }}
                  value={status}
                  onChange={(val) => {
                    setStatus(val)
                    setLoadedCount(PAGE_SIZE)
                  }}
                  options={INITIATED_STATUS_OPTIONS}
                />
                <Select
                  size="small"
                  allowClear
                  placeholder="紧急度"
                  style={{ width: 90 }}
                  value={urgency}
                  onChange={(val) => {
                    setUrgency(val)
                    setLoadedCount(PAGE_SIZE)
                  }}
                  options={INITIATED_URGENCY_OPTIONS}
                />
              </Space>
            </div>
          }
          dataSource={list}
          rowKey={(ticket) => ticket.id}
          renderItem={(ticket) => (
            <InitiatedTicketCard ticket={ticket} onUrge={handleUrge} onWithdraw={handleWithdraw} />
          )}
          pagination={{ total, pageSize: PAGE_SIZE, hasMore }}
          paginationMode="loadMore"
          onLoadMore={() => setLoadedCount((count) => count + PAGE_SIZE)}
        />
      </div>

      <div className={styles.rightPanel}>
        <Empty description="请在左侧选择工单查看" />
      </div>

      <CreateTicketModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  )
}
