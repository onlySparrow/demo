import { Button, Checkbox, Empty, Pagination, Spin } from 'antd'
import type { CSSProperties, Key, ReactNode, UIEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import styles from './BaseList.module.scss'

/** 分页配置 */
export interface BaseListPagination {
  /** 每页条数,默认 10 */
  pageSize?: number
  /** 总条数 */
  total: number
  /** 当前页码(bottom 模式受控) */
  current?: number
  /** 页码 / 每页条数变化回调 */
  onChange?: (page: number, pageSize: number) => void
  /** 是否还有更多数据(loadMore 模式) */
  hasMore?: boolean
}

/** 行渲染上下文 —— selectable 开启时提供行选择框节点,由行内容决定摆放位置(如标题前) */
export interface BaseListRenderContext {
  checkbox: ReactNode
}

export interface BaseListProps<T> {
  /** 顶部标题 */
  title?: ReactNode
  /** 标题右侧内容(如数量统计) */
  titleExtra?: ReactNode
  /** 筛选条件插槽 */
  filterSlot?: ReactNode
  /** 筛选行右侧插槽(紧贴筛选条件同行) */
  filterExtraSlot?: ReactNode
  /** 工具条插槽:渲染在筛选行与列表之间(如智能排序等操作) */
  toolbarSlot?: ReactNode
  /**
   * 工具条固定:默认 false 随列表一起滚动;
   * 开启后渲染在滚动区外,位置恒定不随列表滚动。
   */
  toolbarSticky?: boolean
  /** 数据源 */
  dataSource: T[]
  /** 行 key */
  rowKey: (item: T) => Key
  /** 行内容渲染;第二个参数提供行选择框节点(selectable 开启时) */
  renderItem: (item: T, context: BaseListRenderContext) => ReactNode
  /** 加载中 */
  loading?: boolean
  /** 是否展示行选择框 */
  selectable?: boolean
  /** 已选中行 key 集合(受控) */
  selectedRowKeys?: Key[]
  onSelectedChange?: (keys: Key[]) => void
  /**
   * 批量操作插槽:有选中项时在筛选行与列表之间弹出通栏操作条
   * (横跨整个内容区,按钮内容由各页面自定义)。
   */
  batchSlot?: ReactNode
  /** 分页配置;不传则不分页 */
  pagination?: BaseListPagination
  /**
   * 分页形式:loadMore 上拉加载下一页(默认) /
   * bottom 固定在底部的经典分页器
   */
  paginationMode?: 'loadMore' | 'bottom'
  /** 上拉加载下一页回调(loadMore 模式) */
  onLoadMore?: () => void
  /** 空态文案 */
  emptyText?: string
}

const DEFAULT_PAGE_SIZE = 10

/**
 * 基础列表组件 —— 标题 / 筛选插槽 / 可选行选择框 / 可配分页(上拉加载或底部经典分页)。
 * 只负责列表壳,行内容由 renderItem 决定。
 */
export function BaseList<T>(props: BaseListProps<T>) {
  const {
    title,
    titleExtra,
    filterSlot,
    filterExtraSlot,
    toolbarSlot,
    toolbarSticky,
    dataSource,
    rowKey,
    renderItem,
    loading,
    selectable,
    selectedRowKeys = [],
    onSelectedChange,
    batchSlot,
    pagination,
    paginationMode = 'loadMore',
    onLoadMore,
    emptyText = '暂无数据',
  } = props

  const pageSize = pagination?.pageSize ?? DEFAULT_PAGE_SIZE
  const loadingLock = useRef(false)
  const listRef = useRef<HTMLDivElement>(null)
  const filterRef = useRef<HTMLDivElement>(null)
  const [batchBarStyle, setBatchBarStyle] = useState<CSSProperties>()

  const showBatchBar = Boolean(selectable && batchSlot && selectedRowKeys.length > 0)

  /**
   * 批量操作条通栏横跨内容区、悬浮在整个内容区底部:
   * 水平取列表容器左缘(即内容区左缘)到视口右侧留边,窗口变化时跟随。
   */
  useEffect(() => {
    if (!showBatchBar) {
      return
    }

    const updateBatchBarPosition = () => {
      const listRect = listRef.current?.getBoundingClientRect()
      if (!listRect) {
        return
      }
      setBatchBarStyle({ left: listRect.left, right: 16, bottom: 16 })
    }

    updateBatchBarPosition()
    window.addEventListener('resize', updateBatchBarPosition)
    return () => window.removeEventListener('resize', updateBatchBarPosition)
  }, [showBatchBar])

  /** 上拉触底加载下一页 */
  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    if (paginationMode !== 'loadMore' || !pagination?.hasMore || !onLoadMore || loading) {
      return
    }
    const el = event.currentTarget
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 40) {
      if (loadingLock.current) {
        return
      }
      loadingLock.current = true
      onLoadMore()
      // 防重复触发:下一帧解锁;持续防抖由调用方的 loading 态控制
      requestAnimationFrame(() => {
        loadingLock.current = false
      })
    }
  }

  const toggleRow = (key: Key, checked: boolean) => {
    if (!onSelectedChange) {
      return
    }
    onSelectedChange(
      checked ? [...selectedRowKeys, key] : selectedRowKeys.filter((item) => item !== key),
    )
  }

  /** 当前加载的行是否已全部选中 */
  const pageKeys = dataSource.map(rowKey)
  const allSelected = pageKeys.length > 0 && pageKeys.every((key) => selectedRowKeys.includes(key))

  /** 全选 / 取消全选(作用于当前加载的全部行) */
  const toggleSelectAll = () => {
    if (!onSelectedChange) {
      return
    }
    onSelectedChange(
      allSelected
        ? selectedRowKeys.filter((key) => !pageKeys.includes(key))
        : [...new Set([...selectedRowKeys, ...pageKeys])],
    )
  }

  return (
    <div ref={listRef} className={styles.list}>
      {(title || titleExtra || selectable) && (
        <div className={styles.header}>
          <div className={styles.headerMain}>
            <div className={styles.title}>{title}</div>
            {/* selectable 时:标题后展示带复选框的全选(三态)与已选数量 */}
            {selectable && (
              <Checkbox
                className={styles.selectAll}
                checked={allSelected}
                indeterminate={!allSelected && selectedRowKeys.length > 0}
                onChange={toggleSelectAll}
              >
                全选
              </Checkbox>
            )}
            {selectable && selectedRowKeys.length > 0 && (
              <span className={styles.selectedCount}>已选 {selectedRowKeys.length} 项</span>
            )}
          </div>
          {titleExtra && <div className={styles.titleExtra}>{titleExtra}</div>}
        </div>
      )}

      {(filterSlot || filterExtraSlot) && (
        <div ref={filterRef} className={styles.filter}>
          {filterSlot && <div className={styles.filterItems}>{filterSlot}</div>}
          {filterExtraSlot && <div className={styles.filterExtra}>{filterExtraSlot}</div>}
        </div>
      )}

      {/* 工具条固定模式:渲染在滚动区外,位置恒定 */}
      {toolbarSlot && toolbarSticky && <div className={styles.toolbarFixed}>{toolbarSlot}</div>}

      <div
        className={showBatchBar ? `${styles.body} ${styles.bodyWithBatch}` : styles.body}
        onScroll={handleScroll}
      >
        {/* 工具条默认模式:位于滚动区内,跟随第一条内容滚走 */}
        {toolbarSlot && !toolbarSticky && <div className={styles.toolbar}>{toolbarSlot}</div>}
        {loading && dataSource.length === 0 ? (
          <Spin className={styles.centerSpin} />
        ) : dataSource.length === 0 ? (
          <Empty className={styles.centerEmpty} description={emptyText} />
        ) : (
          <>
            {dataSource.map((item) => {
              const key = rowKey(item)

              return (
                <div key={key} className={styles.row}>
                  <div className={styles.rowContent}>
                    {renderItem(item, {
                      checkbox: selectable ? (
                        <Checkbox
                          className={styles.rowCheckbox}
                          checked={selectedRowKeys.includes(key)}
                          onChange={(event) => toggleRow(key, event.target.checked)}
                        />
                      ) : null,
                    })}
                  </div>
                </div>
              )
            })}

            {loading && dataSource.length > 0 && <Spin className={styles.moreSpin} size="small" />}
            {paginationMode === 'loadMore' &&
              pagination?.hasMore &&
              !loading &&
              dataSource.length > 0 && <div className={styles.loadMoreHint}>上拉加载更多</div>}
            {paginationMode === 'loadMore' && !pagination?.hasMore && dataSource.length > 0 && (
              <div className={styles.loadMoreHint}>没有更多了</div>
            )}
          </>
        )}
      </div>

      {paginationMode === 'bottom' && pagination && (
        <div className={styles.footer}>
          <Pagination
            size="small"
            current={pagination.current}
            total={pagination.total}
            pageSize={pageSize}
            showSizeChanger
            showTotal={(total) => `共 ${total} 条`}
            onChange={pagination.onChange}
          />
        </div>
      )}

      {/* 批量操作条:通栏横跨内容区,悬浮在整个内容区底部(Portal 挂 body,坐标动态测量) */}
      {showBatchBar
        ? createPortal(
            <div className={styles.batchBar} style={batchBarStyle}>
              <span className={styles.batchCount}>已选 {selectedRowKeys.length} 项</span>
              <div className={styles.batchActions}>{batchSlot}</div>
              {/* 取消选择 */}
              <Button
                className={styles.batchCancel}
                type="text"
                size="small"
                onClick={() => onSelectedChange?.([])}
              >
                取消
              </Button>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
