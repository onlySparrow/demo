import { ReloadOutlined } from '@ant-design/icons'
import { Button, Empty, Input, Select, Space } from 'antd'
import { useEffect, useState } from 'react'

import { BaseList } from '@/components/BaseList'
import { fetchReadNotices, type NoticeItem } from '@/api/notice'

import { ReadNoticeCard } from './components/ReadNoticeCard'
import { READ_CATEGORY_OPTIONS } from './config'

import styles from './index.module.scss'

const PAGE_SIZE = 10

/**
 * 已阅通知视图。
 */
export function ReadNoticePage() {
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<NoticeItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const [keyword, setKeyword] = useState<string>('')
  const [category, setCategory] = useState<string | undefined>(undefined)

  const loadData = () => {
    setLoading(true)
    fetchReadNotices({
      page,
      pageSize,
      keyword,
      category,
    })
      .then((res) => {
        setList(res.list)
        setTotal(res.total)
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
  }, [page, pageSize, keyword, category])

  /** 底部分页翻页 / 切换每页条数(切条数回到第 1 页) */
  const handlePageChange = (next: number, nextSize: number) => {
    setPageSize(nextSize)
    setPage(nextSize !== pageSize ? 1 : next)
  }

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
                  style={{ width: 120 }}
                  value={category}
                  onChange={(val) => {
                    setCategory(val)
                    setPage(1)
                  }}
                  options={READ_CATEGORY_OPTIONS}
                />
              </Space>
            </div>
          }
          dataSource={list}
          rowKey={(item) => item.id}
          renderItem={(notice) => <ReadNoticeCard notice={notice} />}
          pagination={{ total, pageSize, current: page, onChange: handlePageChange }}
        />
      </div>

      <div className={styles.rightPanel}>
        <Empty description="请在左侧选择已阅通知" />
      </div>
    </div>
  )
}
