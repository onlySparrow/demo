import { Button, Empty, Input, Select, Space, message } from 'antd'
import { useEffect, useState } from 'react'
import type { Key } from 'react'

import { BaseList } from '@/components/BaseList'
import {
  acceptPendingOrder,
  batchAcceptPendingOrders,
  fetchPendingOrders,
  type PendingOrderTicket,
} from '@/api/pendingOrder'

import { PendingOrderCard } from './components/PendingOrderCard'
import { PENDING_PRIORITY_OPTIONS, PENDING_SYSTEM_OPTIONS } from './config'

import styles from './index.module.scss'

const PAGE_SIZE = 10

/**
 * 待接单视图:左工单池列表(卡片带立即接单) + 右详情分栏。
 */
export function PendingOrderPage() {
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<PendingOrderTicket[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const [keyword, setKeyword] = useState<string>('')
  const [priority, setPriority] = useState<string | undefined>(undefined)
  const [app, setApp] = useState<string | undefined>(undefined)
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([])
  const [acceptingId, setAcceptingId] = useState<string | null>(null)

  const loadData = () => {
    setLoading(true)
    fetchPendingOrders({
      page,
      pageSize,
      keyword,
      priority,
      app,
    })
      .then((res) => {
        setList(res.list)
        setTotal(res.total)
      })
      .catch((err) => {
        console.error('[pending-order] 获取列表失败:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    loadData()
  }, [page, pageSize, keyword, priority, app])

  /** 底部分页翻页 / 切换每页条数(切条数回到第 1 页,并清空勾选) */
  const handlePageChange = (next: number, nextSize: number) => {
    setPageSize(nextSize)
    setPage(nextSize !== pageSize ? 1 : next)
    setSelectedKeys([])
  }

  const handleAccept = async (id: string) => {
    setAcceptingId(id)
    try {
      const res = await acceptPendingOrder(id)
      message.success(res.message || '接单成功')
      loadData()
    } catch {
      message.error('接单失败，请稍后重试')
    } finally {
      setAcceptingId(null)
    }
  }

  const handleBatchAccept = async () => {
    if (selectedKeys.length === 0) return
    const ids = selectedKeys.map(String)
    try {
      const res = await batchAcceptPendingOrders(ids)
      message.success(`成功批量接单 ${res.count} 项`)
      setSelectedKeys([])
      loadData()
    } catch {
      message.error('批量接单失败')
    }
  }

  return (
    <div className={styles.layout}>
      <div className={styles.leftPanel}>
        <BaseList<PendingOrderTicket>
          title="待接单工单"
          titleExtra={<span>共 {total} 条</span>}
          loading={loading}
          filterSlot={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
              <Input.Search
                size="small"
                placeholder="请输入工单标题/系统"
                allowClear
                onSearch={(val) => {
                  setKeyword(val)
                  setPage(1)
                }}
              />
              <Space wrap size={8}>
                <Select
                  size="small"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="所属系统"
                  style={{ width: 130 }}
                  value={app}
                  onChange={(val) => {
                    setApp(val)
                    setPage(1)
                  }}
                  options={PENDING_SYSTEM_OPTIONS}
                />
                <Select
                  size="small"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="紧急度"
                  style={{ width: 90 }}
                  value={priority}
                  onChange={(val) => {
                    setPriority(val)
                    setPage(1)
                  }}
                  options={PENDING_PRIORITY_OPTIONS}
                />
              </Space>
            </div>
          }
          dataSource={list}
          rowKey={(ticket) => ticket.id}
          renderItem={(ticket, { checkbox }) => (
            <PendingOrderCard
              ticket={ticket}
              checkbox={checkbox}
              accepting={acceptingId === ticket.id}
              onAccept={handleAccept}
            />
          )}
          selectable
          selectedRowKeys={selectedKeys}
          onSelectedChange={setSelectedKeys}
          batchSlot={
            <Button size="small" type="primary" onClick={handleBatchAccept}>
              批量接单 ({selectedKeys.length})
            </Button>
          }
          pagination={{ total, pageSize, current: page, onChange: handlePageChange }}
        />
      </div>

      <div className={styles.rightPanel}>
        <Empty description="请在左侧选择待接单工单" />
      </div>
    </div>
  )
}
