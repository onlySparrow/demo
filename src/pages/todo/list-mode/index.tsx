import { Button, Empty, Input, Select, Space, message } from 'antd'
import { useEffect, useState } from 'react'
import type { Key } from 'react'

import { MaterialIcon } from '../../../components/MaterialIcon'
import { BaseList } from '../../../components/BaseList'
// 先引入 todoMock.ts，待后端接口开发就绪后直接改为: import { fetchTodoList, type TodoTicket } from '../../../api/todo'
import { fetchTodoList, type TodoTicket } from '../../../api/todoMock'

import { TodoTicketCard } from './components/TodoTicketCard'
import { TODO_PRIORITY_OPTIONS } from '../config'

import styles from './index.module.scss'

/** 演示用每页条数(BaseList 默认也是 10) */
const PAGE_SIZE = 10

/**
 * 待办 - 列表模式:左侧工单列表 + 右侧详情分栏。
 * 数据通过 fetchTodoList 异步获取。
 */
export function TodoListMode() {
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<TodoTicket[]>([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loadedCount, setLoadedCount] = useState(PAGE_SIZE)
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([])
  const [smartSort, setSmartSort] = useState(false)
  const [priority, setPriority] = useState<string | undefined>(undefined)
  const [keyword, setKeyword] = useState<string>('')

  const loadData = () => {
    setLoading(true)
    fetchTodoList({
      page: 1,
      pageSize: loadedCount,
      priority,
      smartSort,
      keyword,
    })
      .then((res) => {
        setList(res.list)
        setTotal(res.total)
        setHasMore(Boolean(res.hasMore))
      })
      .catch((error) => {
        console.error('[todo] 获取待办列表失败:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    loadData()
  }, [loadedCount, priority, smartSort, keyword])

  const handlePriorityChange = (value?: string) => {
    setPriority(value)
    setLoadedCount(PAGE_SIZE)
  }

  const handleToggleSmartSort = () => {
    setSmartSort((value) => !value)
    setLoadedCount(PAGE_SIZE)
  }

  const handleBatch = (action: string) => {
    if (selectedKeys.length === 0) return
    message.success(`已批量${action} ${selectedKeys.length} 项工单`)
    setSelectedKeys([])
  }

  return (
    <div className={styles.layout}>
      <div className={styles.leftPanel}>
        <BaseList<TodoTicket>
          title="待办工单"
          titleExtra={<span>共 {total} 条</span>}
          loading={loading}
          filterSlot={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
              <Input.Search
                size="small"
                placeholder="请输入工单名称/来源检索"
                allowClear
                onSearch={(val) => {
                  setKeyword(val)
                  setLoadedCount(PAGE_SIZE)
                }}
              />
              <Space wrap size={8}>
                <Select
                  size="small"
                  allowClear
                  placeholder="紧急度"
                  style={{ width: 100 }}
                  value={priority}
                  onChange={handlePriorityChange}
                  options={TODO_PRIORITY_OPTIONS}
                />
              </Space>
            </div>
          }
          toolbarSticky={false}
          toolbarSlot={
            <Button
              size="small"
              type={smartSort ? 'primary' : 'default'}
              icon={<MaterialIcon name="sort" className={styles.sortIcon} />}
              onClick={handleToggleSmartSort}
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
              <Button size="small" type="primary" onClick={() => handleBatch('通过')}>
                批量通过
              </Button>
              <Button size="small" danger onClick={() => handleBatch('驳回')}>
                批量驳回
              </Button>
              <Button size="small" danger onClick={() => handleBatch('删除')}>
                批量删除
              </Button>
            </>
          }
          pagination={{ total, pageSize: PAGE_SIZE, hasMore }}
          paginationMode="loadMore"
          onLoadMore={() => setLoadedCount((count) => count + PAGE_SIZE)}
        />
      </div>

      <div className={styles.rightPanel}>
        <Empty description="请在左侧选择待办工单" />
      </div>
    </div>
  )
}
