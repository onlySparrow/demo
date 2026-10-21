import { ReloadOutlined } from '@ant-design/icons'
import { Button, Empty, Input, Select, Space, message } from 'antd'
import { useEffect, useState } from 'react'
import type { Key } from 'react'

import { BaseList } from '@/components/BaseList'
import {
  batchMarkNoticesAsRead,
  fetchUnreadNotices,
  markNoticeAsRead,
  type NoticeItem,
} from '@/api/notice'

import { UnreadNoticeCard } from './components/UnreadNoticeCard'
import { UNREAD_CATEGORY_OPTIONS, UNREAD_URGENCY_OPTIONS } from './config'

import styles from './index.module.scss'

const PAGE_SIZE = 10

/**
 * 待阅通知视图。
 */
export function UnreadNoticePage() {
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<NoticeItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const [keyword, setKeyword] = useState<string>('')
  const [category, setCategory] = useState<string | undefined>(undefined)
  const [urgency, setUrgency] = useState<string | undefined>(undefined)
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([])

  const loadData = () => {
    setLoading(true)
    fetchUnreadNotices({
      page,
      pageSize,
      keyword,
      category,
      urgency,
    })
      .then((res) => {
        setList(res.list)
        setTotal(res.total)
      })
      .catch((err) => {
        console.error('[notice] 获取待阅通知失败:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    loadData()
  }, [page, pageSize, keyword, category, urgency])

  /** 底部分页翻页 / 切换每页条数(切条数回到第 1 页,并清空勾选) */
  const handlePageChange = (next: number, nextSize: number) => {
    setPageSize(nextSize)
    setPage(nextSize !== pageSize ? 1 : next)
    setSelectedKeys([])
  }

  const handleMarkRead = async (id: string) => {
    try {
      await markNoticeAsRead(id)
      message.success('已标记为已阅')
      loadData()
    } catch {
      message.error('操作失败')
    }
  }

  const handleBatchMarkRead = async () => {
    if (selectedKeys.length === 0) return
    const ids = selectedKeys.map(String)
    try {
      const res = await batchMarkNoticesAsRead(ids)
      message.success(`已批量标记 ${res.count} 项通知为已阅`)
      setSelectedKeys([])
      loadData()
    } catch {
      message.error('批量操作失败')
    }
  }

  return (
    <div className={styles.layout}>
      <div className={styles.leftPanel}>
        <BaseList<NoticeItem>
          title="待阅通知"
          titleExtra={<span>共 {total} 条</span>}
          loading={loading}
          filterSlot={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <Input.Search
                  size="small"
                  placeholder="请输入通知标题/部门"
                  allowClear
                  onSearch={(val) => {
                    setKeyword(val)
                    setPage(1)
                  }}
                  style={{ flex: 1 }}
                />
                <Button size="small" icon={<ReloadOutlined />} onClick={loadData} title="刷新" />
              </div>
              <Space wrap size={8}>
                <Select
                  size="small"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="分类"
                  style={{ width: 110 }}
                  value={category}
                  onChange={(val) => {
                    setCategory(val)
                    setPage(1)
                  }}
                  options={UNREAD_CATEGORY_OPTIONS}
                />
                <Select
                  size="small"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="紧急度"
                  style={{ width: 90 }}
                  value={urgency}
                  onChange={(val) => {
                    setUrgency(val)
                    setPage(1)
                  }}
                  options={UNREAD_URGENCY_OPTIONS}
                />
              </Space>
            </div>
          }
          dataSource={list}
          rowKey={(item) => item.id}
          renderItem={(notice, { checkbox }) => (
            <UnreadNoticeCard notice={notice} checkbox={checkbox} onMarkRead={handleMarkRead} />
          )}
          selectable
          selectedRowKeys={selectedKeys}
          onSelectedChange={setSelectedKeys}
          batchSlot={
            <Button size="small" type="primary" onClick={handleBatchMarkRead}>
              批量已阅 ({selectedKeys.length})
            </Button>
          }
          pagination={{ total, pageSize, current: page, onChange: handlePageChange }}
        />
      </div>

      <div className={styles.rightPanel}>
        <Empty description="请在左侧选择待阅通知" />
      </div>
    </div>
  )
}
