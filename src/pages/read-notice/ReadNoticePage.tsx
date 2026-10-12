import { ReloadOutlined } from '@ant-design/icons'
import { Button, Empty, Input, Select, Space } from 'antd'
import { useEffect, useState } from 'react'

import { BaseList } from '../../components/BaseList'
// 先引入 noticeMock.ts，待后端接口开发就绪后直接改为: import { fetchReadNotices, type NoticeItem } from '../../api/notice'
import { fetchReadNotices, type NoticeItem } from '../../api/noticeMock'

import { ReadNoticeCard } from './components/ReadNoticeCard'
import { READ_CATEGORY_OPTIONS } from './config'

import styles from './ReadNoticePage.module.scss'

const PAGE_SIZE = 10

/**
 * 已阅通知视图。
 */
export function ReadNoticePage() {
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<NoticeItem[]>([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loadedCount, setLoadedCount] = useState(PAGE_SIZE)
  const [keyword, setKeyword] = useState<string>('')
  const [category, setCategory] = useState<string | undefined>(undefined)

  const loadData = () => {
    setLoading(true)
    fetchReadNotices({
      page: 1,
      pageSize: loadedCount,
      keyword,
      category,
    })
      .then((res) => {
        setList(res.list)
        setTotal(res.total)
        setHasMore(Boolean(res.hasMore))
      })
      .catch((err) => {
        console.error('[notice] 获取已阅通知失败:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    loadData()
  }, [loadedCount, keyword, category])

  return (
    <div className={styles.layout}>
      <div className={styles.leftPanel}>
        <BaseList<NoticeItem>
          title="已阅通知"
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
                  placeholder="分类"
                  style={{ width: 120 }}
                  value={category}
                  onChange={(val) => {
                    setCategory(val)
                    setLoadedCount(PAGE_SIZE)
                  }}
                  options={READ_CATEGORY_OPTIONS}
                />
              </Space>
            </div>
          }
          dataSource={list}
          rowKey={(item) => item.id}
          renderItem={(notice) => <ReadNoticeCard notice={notice} />}
          pagination={{ total, pageSize: PAGE_SIZE, hasMore }}
          paginationMode="loadMore"
          onLoadMore={() => setLoadedCount((count) => count + PAGE_SIZE)}
        />
      </div>

      <div className={styles.rightPanel}>
        <Empty description="请在左侧选择已阅通知" />
      </div>
    </div>
  )
}
