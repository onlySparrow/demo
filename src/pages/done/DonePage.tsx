import { ReloadOutlined } from '@ant-design/icons'
import { Button, Empty, Input, Select, Space } from 'antd'
import { useEffect, useState } from 'react'

import { BaseList } from '../../components/BaseList'
// 先引入 doneMock.ts，待后端接口开发就绪后直接改为: import { fetchDoneOrders, type DoneTicket } from '../../api/done'
import { fetchDoneOrders, type DoneTicket } from '../../api/doneMock'

import { DoneTicketCard } from './components/DoneTicketCard'
import { DONE_RESULT_OPTIONS, DONE_SOURCE_OPTIONS } from './config'

import styles from './DonePage.module.scss'

const PAGE_SIZE = 10

/**
 * 已办工单视图。
 */
export function DonePage() {
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<DoneTicket[]>([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loadedCount, setLoadedCount] = useState(PAGE_SIZE)
  const [keyword, setKeyword] = useState<string>('')
  const [result, setResult] = useState<string | undefined>(undefined)
  const [source, setSource] = useState<string | undefined>(undefined)

  const loadData = () => {
    setLoading(true)
    fetchDoneOrders({
      page: 1,
      pageSize: loadedCount,
      keyword,
      result,
      source,
    })
      .then((res) => {
        setList(res.list)
        setTotal(res.total)
        setHasMore(Boolean(res.hasMore))
      })
      .catch((err) => {
        console.error('[done] 获取已办工单失败:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    loadData()
  }, [loadedCount, keyword, result, source])

  return (
    <div className={styles.layout}>
      <div className={styles.leftPanel}>
        <BaseList<DoneTicket>
          title="已办工单"
          titleExtra={<span>共 {total} 条</span>}
          loading={loading}
          filterSlot={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <Input.Search
                  size="small"
                  placeholder="请输入工单名称/编号"
                  allowClear
                  onSearch={(val) => {
                    setKeyword(val)
                    setLoadedCount(PAGE_SIZE)
                  }}
                  style={{ flex: 1 }}
                />
                <Button size="small" icon={<ReloadOutlined />} onClick={loadData} title="刷新" />
              </div>
              <Space wrap size={8}>
                <Select
                  size="small"
                  allowClear
                  placeholder="处理结果"
                  style={{ width: 110 }}
                  value={result}
                  onChange={(val) => {
                    setResult(val)
                    setLoadedCount(PAGE_SIZE)
                  }}
                  options={DONE_RESULT_OPTIONS}
                />
                <Select
                  size="small"
                  allowClear
                  placeholder="来源系统"
                  style={{ width: 130 }}
                  value={source}
                  onChange={(val) => {
                    setSource(val)
                    setLoadedCount(PAGE_SIZE)
                  }}
                  options={DONE_SOURCE_OPTIONS}
                />
              </Space>
            </div>
          }
          dataSource={list}
          rowKey={(ticket) => ticket.id}
          renderItem={(ticket) => <DoneTicketCard ticket={ticket} />}
          pagination={{ total, pageSize: PAGE_SIZE, hasMore }}
          paginationMode="loadMore"
          onLoadMore={() => setLoadedCount((count) => count + PAGE_SIZE)}
        />
      </div>

      <div className={styles.rightPanel}>
        <Empty description="请在左侧选择已办工单" />
      </div>
    </div>
  )
}
