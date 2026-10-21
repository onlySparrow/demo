import { Button, DatePicker, Empty, Form, Input, Modal, Select, message } from 'antd'
import type { Dayjs } from 'dayjs'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Key } from 'react'

import { SearchIcon } from '@/assets/icons'
import { BaseList } from '@/components/BaseList'
import {
  batchProcessTodo,
  fetchTodoDetail,
  fetchTodoList,
  type TodoTicket,
} from '@/api/todo'
import { useMenuBadgeStore } from '@/store/menuBadgeStore'

import { TodoTicketCard } from '../../list-mode/components/TodoTicketCard'
import { TODO_PRIORITY_OPTIONS, TODO_SOURCE_OPTIONS } from '../../config'

import styles from './index.module.scss'

/** 演示用每页条数(BaseList 默认也是 10) */
const PAGE_SIZE = 10

/** 工单编号特征(WO- / NET- 开头):后端 keyword 暂只匹配标题,单号搜索走本地兜底 */
const TICKET_NO_PATTERN = /^(wo|net)[-\d]/i

/** 本地兜底搜索一次拉取的条数(与地图模式一致) */
const FALLBACK_SEARCH_SIZE = 200

/** 批量操作类型 —— 待办仅支持通过 / 驳回 */
type BatchAction = '通过' | '驳回'

/** 批量操作预填审批意见 */
const BATCH_COMMENT: Record<BatchAction, string> = {
  通过: '同意',
  驳回: '驳回',
}

/**
 * 待办工单列表面板(列表模式左侧面板与地图模式侧栏共用的通用组件):
 * 筛选(名称/编号/来源/紧急程度/日期) + 卡片列表(TodoTicketCard) + 底部分页 +
 * 多选批量通过/驳回 + 深链选中 + 外部刷新联动。
 * 容器尺寸/定位由使用方控制,组件自身占满父容器。
 */
export function TodoListPanel({
  onSelectTicket,
  activeId,
  focusId,
  refillDetail = false,
  onListChange,
  onSelectedChange,
  refreshSignal,
  onDataRefresh,
}: {
  /** 卡片点选回调(列表模式=打开右侧详情,地图模式=定位到地图落点) */
  onSelectTicket?: (ticket: TodoTicket) => void
  /** 激活高亮的工单 id(卡片浅蓝高亮) */
  activeId?: string | null
  /** 深链工单 id(?id=):列表加载后自动选中并触发 onSelectTicket */
  focusId?: string | null
  /** 点选卡片时后台调详情接口回填列表数据(列表模式开启) */
  refillDetail?: boolean
  /** 列表数据变化通知(父层联动,如筛选后清理激活详情) */
  onListChange?: (list: TodoTicket[]) => void
  /** 勾选集合变化通知(地图模式用于标注勾选态) */
  onSelectedChange?: (keys: string[]) => void
  /** 外部刷新信号:变化时重拉列表(如转派成功后) */
  refreshSignal?: number
  /** 数据变更(批量流转/刷新)通知,地图模式可据此重拉标注数据 */
  onDataRefresh?: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<TodoTicket[]>([])
  const [total, setTotal] = useState(0)
  /** 当前页码(底部分页,从 1 开始) */
  const [page, setPage] = useState(1)
  /** 每页条数(底部分页器可切换) */
  const [pageSize, setPageSize] = useState(PAGE_SIZE)

  /** 多选（批量操作） */
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([])

  /**
   * 已消费的深链 id —— 入参只在首次请求带上、选中只应用一次,
   * 避免后续筛选/刷新被深链参数持续干扰(后端支持 id 过滤后尤其重要)。
   */
  const consumedFocusRef = useRef<string | null>(null)
  /** 菜单角标刷新(取 /todo/list 的 total) */
  const refreshMenuBadge = useMenuBadgeStore((state) => state.fetchMenuBadgeCounts)
  /** 外部刷新信号基线:跳过首次渲染,信号变化才触发重拉 */
  const refreshSignalRef = useRef(refreshSignal)

  /** 工单标题检索词(后端 keyword) */
  const [titleKeyword, setTitleKeyword] = useState('')
  /** 工单编号检索词(后端暂不支持,本地匹配 ticketNo/netTicketNo/id) */
  const [ticketNoKeyword, setTicketNoKeyword] = useState('')
  const [priority, setPriority] = useState<string | undefined>(undefined)
  const [source, setSource] = useState<string | undefined>(undefined)
  /** 工单发起时间筛选(年月日) —— 与卡片展示的工单发起时间为同一字段 */
  const [date, setDate] = useState<Dayjs | null>(null)

  /** 按工单编号本地匹配(编号纯前端过滤,后端 keyword 只认标题) */
  const matchByTicketNo = (rows: TodoTicket[], no: string) => {
    const lower = no.toLowerCase()
    return rows.filter((t) =>
      [t.ticketNo, t.netTicketNo, t.id].some((v) => (v ?? '').toLowerCase().includes(lower)),
    )
  }

  const loadData = useCallback(() => {
    setLoading(true)
    const titleKw = titleKeyword.trim()
    const noKw = ticketNoKeyword.trim()
    const baseParams = {
      priority,
      source,
      date: date?.format('YYYY-MM-DD'),
    }
    // 深链 ?id= :首次请求按需求带上入参;消费后不再携带
    const focusParam =
      focusId && consumedFocusRef.current !== focusId ? focusId : undefined

    const run = async () => {
      try {
        // 工单编号:后端暂不支持按编号检索,直接拉一页大列表本地匹配后按页切片
        // (标题词同时下发给后端,两个条件是「与」的关系)
        if (noKw) {
          const all = await fetchTodoList({
            page: 1,
            pageSize: FALLBACK_SEARCH_SIZE,
            keyword: titleKw || undefined,
            ...baseParams,
          })
          const matched = matchByTicketNo(all?.list ?? [], noKw)
          setList(matched.slice((page - 1) * pageSize, page * pageSize))
          setTotal(matched.length)
          return
        }

        const res = await fetchTodoList({
          page,
          pageSize,
          keyword: titleKw || undefined,
          id: focusParam,
          ...baseParams,
        })
        let listData = res?.list ?? []
        let nextTotal = res?.total ?? 0

        // 兼容:标题框里输入的是单号形态(WO-/NET-)且服务端无结果时,也走本地编号匹配
        if (titleKw && nextTotal === 0 && TICKET_NO_PATTERN.test(titleKw)) {
          const all = await fetchTodoList({
            page: 1,
            pageSize: FALLBACK_SEARCH_SIZE,
            ...baseParams,
          })
          const matched = matchByTicketNo(all?.list ?? [], titleKw)
          nextTotal = matched.length
          listData = matched.slice((page - 1) * pageSize, page * pageSize)
        }

        // 筛选/批量流转后总页数变少:当前页越界时回退到最后一页(触发重查)
        const maxPage = Math.max(1, Math.ceil(nextTotal / pageSize))
        if (page > maxPage) {
          setPage(maxPage)
          return
        }

        setList(listData)
        setTotal(nextTotal)
      } catch (error) {
        console.error('[todo] 获取待办列表失败:', error)
        message.error('获取待办列表失败')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [page, pageSize, titleKeyword, ticketNoKeyword, priority, source, date, focusId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 外部刷新信号(转派等操作成功后由父层递增)
  useEffect(() => {
    if (refreshSignal === refreshSignalRef.current) return
    refreshSignalRef.current = refreshSignal
    loadData()
  }, [refreshSignal, loadData])

  // 列表 / 勾选集合变化对外通知
  useEffect(() => {
    onListChange?.(list)
  }, [list, onListChange])

  useEffect(() => {
    onSelectedChange?.(selectedKeys.map(String))
  }, [selectedKeys, onSelectedChange])

  /**
   * 点击卡片:立即回调使用方(列表模式展开详情/地图模式定位);
   * refillDetail 开启时同时调详情接口拉取最新数据回填列表
   * (列表字段可能是快照,详情接口才保证是最新流转状态)。
   */
  const handleSelectTicket = (ticket: TodoTicket) => {
    onSelectTicket?.(ticket)
    if (!refillDetail) return
    fetchTodoDetail(ticket.id)
      .then((detail) => {
        if (!detail) return
        setList((prev) => prev.map((t) => (t.id === detail.id ? detail : t)))
      })
      .catch((error) => {
        // 列表数据已能支撑展示,接口失败仅记录,不打断查看
        console.error('[todo] 获取工单详情失败:', error)
      })
  }

  /**
   * 深链 ?id= :选中该工单(勾选 + 回调使用方);
   * 该工单不在当前列表时,改用详情接口拉取后回调(由使用方兜底展示)。
   */
  useEffect(() => {
    if (!focusId || consumedFocusRef.current === focusId || loading) return
    const hit = list.find((t) => t.id === focusId || t.ticketNo === focusId)
    if (hit) {
      consumedFocusRef.current = focusId
      setSelectedKeys([hit.id])
      handleSelectTicket(hit)
      return
    }
    // 列表还未返回有效数据时先等待,避免误判
    if (list.length === 0) return
    consumedFocusRef.current = focusId
    fetchTodoDetail(focusId)
      .then((ticket) => {
        if (!ticket) return
        onSelectTicket?.(ticket)
      })
      .catch((error) => {
        console.error('[todo] 深链工单详情获取失败:', error)
        message.error('工单详情获取失败')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId, list, loading])

  /** 筛选变更时回到第一页 */
  const resetPage = () => {
    setPage(1)
  }

  /** 回车/点搜索图标触发:回到第一页重新检索 */
  const handleSearch = () => {
    resetPage()
  }

  const handlePriorityChange = (value?: string) => {
    setPriority(value)
    resetPage()
  }

  const handleSourceChange = (value?: string) => {
    setSource(value)
    resetPage()
  }

  const handleDateChange = (value: Dayjs | null) => {
    setDate(value)
    resetPage()
  }

  const handleRefresh = () => {
    loadData()
    onDataRefresh?.()
    message.success('列表已刷新')
  }

  /** 批量二次确认弹窗:action 非空即弹窗打开 */
  const [batchAction, setBatchAction] = useState<BatchAction | null>(null)
  const [batchSubmitting, setBatchSubmitting] = useState(false)
  const [batchForm] = Form.useForm<{ comment: string }>()

  // 弹窗每次打开按操作类型重填审批意见(batchAction 置空即关闭,不清值;重开时显式重设)
  // 注意:外部 form 实例的 store 跨弹窗存活,Form 的 initialValues 只在实例首次挂载生效,
  // 仅靠 destroyOnHidden/key 重挂表单不会恢复预填,必须显式 setFieldsValue
  useEffect(() => {
    if (!batchAction) return
    batchForm.setFieldsValue({ comment: BATCH_COMMENT[batchAction] })
  }, [batchAction, batchForm])

  /** 已选工单数据(确认弹窗展示标题 / 编号,防止误选) */
  const selectedTickets = list.filter((t) => selectedKeys.includes(t.id))

  /** 打开批量二次确认弹窗(预填审批意见) */
  const openBatchConfirm = (action: BatchAction) => {
    if (selectedKeys.length === 0) return
    setBatchAction(action)
  }

  /** 确认执行批量审批:按当前页勾选集合提交 */
  const handleBatchConfirm = async () => {
    if (!batchAction) return
    const { comment } = await batchForm.validateFields()
    setBatchSubmitting(true)
    try {
      const { processed } = await batchProcessTodo({
        action: batchAction,
        ticketIds: selectedKeys.map(String),
        comment,
      })
      setSelectedKeys([])
      setBatchAction(null)
      message.success(`已批量${batchAction} ${processed} 项工单，完成流转`)
      // 流转后服务端(存储)为准重新拉取列表,并刷新菜单角标数量
      loadData()
      refreshMenuBadge()
      onDataRefresh?.()
    } catch (error) {
      console.error('[todo] 批量处理失败:', error)
      message.error('批量处理失败，请稍后重试')
    } finally {
      setBatchSubmitting(false)
    }
  }

  /**
   * 底部分页翻页 / 切换每页条数(切条数回到第 1 页)。
   * 全选仅作用于本页,翻页 / 切条数后清空勾选并重置全选态。
   */
  const handlePageChange = (next: number, nextSize: number) => {
    if (nextSize !== pageSize) {
      setPageSize(nextSize)
      setPage(1)
    } else {
      setPage(next)
    }
    setSelectedKeys([])
  }

  const content = (
    <BaseList<TodoTicket>
      title="待办工单"
      titleExtra={
        /* 总条数由底部分页器展示(共 N 条),标题行只留刷新 */
        <Button size="small" onClick={handleRefresh}>
          刷新
        </Button>
      }
      loading={loading}
      filterSlot={
        <div className={styles.filterBlock}>
          <div className={styles.searchRow}>
            {/* 工单标题:输入即检索(后端 keyword 匹配标题) */}
            <Input
              size="small"
              placeholder="工单标题"
              allowClear
              value={titleKeyword}
              onChange={(e) => setTitleKeyword(e.target.value)}
              onPressEnter={handleSearch}
              className={styles.searchInput}
              suffix={
                <SearchIcon
                  className={styles.searchIcon}
                  onClick={handleSearch}
                  role="button"
                  aria-label="搜索"
                />
              }
            />
            {/* 工单编号:本地按 ticketNo/netTicketNo/id 匹配 */}
            <Input
              size="small"
              placeholder="工单编号"
              allowClear
              value={ticketNoKeyword}
              onChange={(e) => setTicketNoKeyword(e.target.value)}
              onPressEnter={handleSearch}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filterHalfRow}>
            <Select
              size="small"
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="工单来源"
              className={styles.filterHalf}
              value={source}
              onChange={handleSourceChange}
              options={TODO_SOURCE_OPTIONS}
            />
            <Select
              size="small"
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="紧急程度"
              className={styles.filterHalf}
              value={priority}
              onChange={handlePriorityChange}
              options={TODO_PRIORITY_OPTIONS}
            />
          </div>
          <DatePicker
            size="small"
            className={styles.datePickerFull}
            value={date}
            onChange={handleDateChange}
            placeholder="工单发起时间"
          />
        </div>
      }
      dataSource={list}
      rowKey={(ticket) => ticket.id}
      renderItem={(ticket, { checkbox }) => (
        <TodoTicketCard
          ticket={ticket}
          checkbox={
            checkbox ? (
              <span
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                {checkbox}
              </span>
            ) : null
          }
          selected={selectedKeys.includes(ticket.id)}
          active={activeId === ticket.id}
          onClick={() => handleSelectTicket(ticket)}
        />
      )}
      selectable
      selectedRowKeys={selectedKeys}
      onSelectedChange={setSelectedKeys}
      batchSlot={
        <>
          <Button className={styles.batchApproveBtn} onClick={() => openBatchConfirm('通过')}>
            批量通过
          </Button>
          <Button className={styles.batchRejectBtn} onClick={() => openBatchConfirm('驳回')}>
            批量驳回
          </Button>
        </>
      }
      pagination={{
        total,
        pageSize,
        current: page,
        onChange: handlePageChange,
      }}
    />
  )

  return (
    <>
      {content}

      {/* 批量操作二次确认弹窗(高风险操作防误触,展示操作条数与已选清单) */}
      <Modal
        title="批量处理工单"
        open={batchAction !== null}
        okText={batchAction ? `确认${batchAction}` : '确认'}
        cancelText="取消"
        confirmLoading={batchSubmitting}
        okButtonProps={{ danger: batchAction === '驳回' }}
        onOk={handleBatchConfirm}
        onCancel={() => setBatchAction(null)}
        destroyOnHidden
      >
        <p className={styles.batchModalTip}>
          即将对 <strong>{selectedKeys.length}</strong> 项已选工单执行「批量{batchAction}」操作，请仔细核对，防止误操作。
        </p>
        <div className={styles.batchModalList}>
          {selectedTickets.map((ticket) => (
            <div key={ticket.id} className={styles.batchModalItem}>
              <p className={styles.batchModalItemTitle} title={ticket.title}>
                {ticket.title}
              </p>
              <p className={styles.batchModalItemNo}>{ticket.ticketNo}</p>
            </div>
          ))}
        </div>
        {/* 审批意见的预填/重置由弹窗打开时的 useEffect 统一处理(见 batchForm 上方注释) */}
        <Form form={batchForm} layout="vertical">
          <Form.Item
            name="comment"
            label="审批意见"
            rules={[{ required: true, message: '请输入审批意见' }]}
          >
            <Input.TextArea rows={3} maxLength={200} showCount placeholder="请输入审批意见" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
