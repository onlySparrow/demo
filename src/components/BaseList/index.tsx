import { Button, Checkbox, Empty, Pagination, Spin } from 'antd'
import type { CSSProperties, Key, ReactNode } from 'react'
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
  /** 是否展示每页条数切换器,默认 true */
  showSizeChanger?: boolean
  /** 是否展示快速跳转,默认 false */
  showQuickJumper?: boolean
  /** 每页条数选项,默认 [10, 20, 50, 100] */
  pageSizeOptions?: (number | string)[]
  /** 自定义总数文案 */
  showTotal?: (total: number, range: [number, number]) => ReactNode
  /** 是否精简模式,默认 false */
  simple?: boolean
  /** 是否只有一页时隐藏分页器,默认 false */
  hideOnSinglePage?: boolean
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
  /** 分页配置;不传则不分页,传入时在底部渲染经典分页器 */
  pagination?: BaseListPagination
  /** 空态文案 */
  emptyText?: string
}

const DEFAULT_PAGE_SIZE = 10

/**
 * 基础列表组件 —— 标题 / 筛选插槽 / 可选行选择框 / 底部经典分页器。
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
    dataSource = [],
    rowKey,
    renderItem,
    loading,
    selectable,
    selectedRowKeys = [],
    onSelectedChange,
    batchSlot,
    pagination,
    emptyText = '暂无数据',
  } = props

  const pageSize = pagination?.pageSize ?? DEFAULT_PAGE_SIZE
  const listRef = useRef<HTMLDivElement>(null)
  const filterRef = useRef<HTMLDivElement>(null)
  const [batchBarStyle, setBatchBarStyle] = useState<CSSProperties>()

  const showBatchBar = Boolean(selectable && batchSlot && selectedRowKeys.length > 0)
  /** 底部有常驻分页器,批量条需要抬高避让 */
  const withBottomPagination = Boolean(pagination)

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
      // bottom 模式下分页器占据 footer(高约 45px),批量条再往上让出一行
      setBatchBarStyle({
        left: listRect.left,
        right: 16,
        bottom: withBottomPagination ? 56 : 16,
      })
    }

    updateBatchBarPosition()
    window.addEventListener('resize', updateBatchBarPosition)
    return () => window.removeEventListener('resize', updateBatchBarPosition)
  }, [showBatchBar, withBottomPagination])

  /** 单行勾选 / 取消 */
  const toggleRow = (key: Key, checked: boolean) => {
    if (!onSelectedChange) {
      return
    }
    onSelectedChange(
      checked ? [...selectedRowKeys, key] : selectedRowKeys.filter((item) => item !== key),
    )
  }

  /** 当前页行 key 集合及是否已全部选中(全选仅作用于本页) */
  const pageKeys = dataSource.map(rowKey)
  const allSelected = pageKeys.length > 0 && pageKeys.every((key) => selectedRowKeys.includes(key))

  /** 全选 / 取消全选:作用于当前页全部行 */
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
            {/* 全选:仅作用于当前页全部行 */}
            {selectable && (
              <Checkbox
                className={styles.selectAll}
                checked={allSelected}
                indeterminate={!allSelected && selectedRowKeys.length > 0}
                onChange={toggleSelectAll}
                title="选中当前页全部工单"
              >
                全选
              </Checkbox>
            )}
            {selectable && selectedRowKeys.length > 0 && (
              <span className={styles.selectedCount}>
                {`已选 ${selectedRowKeys.length} 项`}
              </span>
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

      <div className={showBatchBar ? `${styles.body} ${styles.bodyWithBatch}` : styles.body}>
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
          </>
        )}
      </div>

      {pagination && (
        <div className={styles.footer}>
          <Pagination
            size="small"
            current={pagination.current ?? 1}
            total={pagination.total ?? 0}
            pageSize={pageSize}
            showSizeChanger={pagination.showSizeChanger ?? true}
            pageSizeOptions={pagination.pageSizeOptions ?? ['10', '20', '50', '100']}
            showQuickJumper={pagination.showQuickJumper}
            simple={pagination.simple}
            hideOnSinglePage={pagination.hideOnSinglePage}
            /* 大数据量下收敛页码窗口:仅展示「1 2 3 ... 末页」,避免页码条过宽挤出内容区 */
            showLessItems
            showTotal={pagination.showTotal ?? ((total) => `共 ${total} 条`)}
            onChange={pagination.onChange}
            disabled={loading}
          />
        </div>
      )}

      {/* 批量操作条:通栏横跨内容区,悬浮在整个内容区底部(Portal 挂 body,坐标动态测量) */}
      {showBatchBar
        ? createPortal(
            <div className={styles.batchBar} style={batchBarStyle}>
              <span className={styles.batchCount}>
                {`已选 ${selectedRowKeys.length} 项`}
              </span>
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
