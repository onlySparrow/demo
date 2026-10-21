import { Button, Checkbox, Drawer, Tabs, message } from 'antd'
import { useCallback, useEffect, useState } from 'react'

import {
  fetchSubscriptionBuffer,
  removeSubscriptionBufferItem,
  type SubscriptionBufferItem,
} from '@/api/todo'
import {
  AnalyticsIcon,
  AutoAwesomeIcon,
  KeyboardArrowDownIcon,
  ReplyIcon,
  StorageIcon,
} from '@/assets/icons'

import type { TodoTicket } from './TodoTicketCard'
import { DraftModal } from './DraftModal'

import styles from './SubscriptionBuffer.module.scss'

const SUB_TABS = [
  { key: 'all', label: '全部数据' },
  { key: 'cell', label: '小区状态' },
  { key: 'alarm', label: '历史告警' },
  { key: 'site', label: '基站状态' },
]

const PLAN_TABS = [
  { key: 'transfer', label: '转派方案' },
  { key: 'stage', label: '阶段反馈' },
  { key: 'return', label: '返单方案' },
]

const PLAN_CONTENT: Record<string, string> = {
  transfer:
    '由于该故障涉及跨区域光缆割接影响，建议转派至丽水当地外线维护班组进行现场熔接排查。',
  stage:
    '当前已完成远程诊断与关联数据分析，确认主因疑似跨区域光缆割接。建议继续观察小区指标，并同步外线班组到站时间。',
  return:
    '经分析该工单归属外线熔接责任，建议返单至属地外线维护班组，附带活动告警与基站状态快照作为依据。',
}

interface SubscriptionBufferProps {
  open: boolean
  ticket: TodoTicket
  onClose: () => void
}

/**
 * 工单订阅缓冲区 —— 数据来自接口；左侧勾选 + 右侧方案预览 + 一键回填
 */
export function SubscriptionBuffer({ open, ticket, onClose }: SubscriptionBufferProps) {
  const [activeTab, setActiveTab] = useState('all')
  const [planTab, setPlanTab] = useState('transfer')
  const [items, setItems] = useState<SubscriptionBufferItem[]>([])
  const [checkedIds, setCheckedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(true)
  const [draftOpen, setDraftOpen] = useState(false)
  const [draftPrefill, setDraftPrefill] = useState('')

  const loadList = useCallback(async () => {
    if (!ticket?.id) return
    setLoading(true)
    try {
      // 演示数据源已注释：真实接口无需预置默认项
      // await ensureDemoSubscriptionBuffer(ticket.id)
      const list = await fetchSubscriptionBuffer({ ticketId: ticket.id, tab: activeTab })
      setItems(list)
      setCheckedIds(list.map((i) => i.id))
    } catch {
      message.error('订阅数据加载失败')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [ticket?.id, activeTab])

  useEffect(() => {
    if (!open) return
    void loadList()
  }, [open, loadList])

  const handleGenerate = () => {
    if (checkedIds.length === 0) {
      message.warning('请先在左侧勾选需要分析的数据项')
      return
    }
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      setGenerated(true)
      message.success('方案已生成（演示）')
    }, 600)
  }

  const handleFillBack = () => {
    const content = PLAN_CONTENT[planTab] || PLAN_CONTENT.transfer
    setDraftPrefill(content)
    setDraftOpen(true)
  }

  const toggleCheck = (id: string, checked: boolean) => {
    setCheckedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)))
  }

  const removeItem = async (id: string) => {
    try {
      await removeSubscriptionBufferItem(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
      setCheckedIds((prev) => prev.filter((x) => x !== id))
      message.success('已删除')
    } catch {
      message.error('删除失败')
    }
  }

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        placement="bottom"
        height="78%"
        closable={false}
        className={styles.drawer}
        styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column' } }}
        title={null}
        destroyOnClose={false}
      >
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <StorageIcon className={styles.headerIcon} />
            <span className={styles.headerTitle}>工单订阅缓冲区</span>
            <span className={styles.headerMeta}>
              {ticket.ticketNo || ticket.id}
              {ticket.siteName ? ` · ${ticket.siteName}` : ''}
            </span>
          </div>
          <button type="button" className={styles.collapseBtn} onClick={onClose} aria-label="收起">
            <KeyboardArrowDownIcon />
          </button>
        </header>

        <div className={styles.content}>
          <div className={styles.leftPane}>
            <Tabs
              size="small"
              activeKey={activeTab}
              onChange={setActiveTab}
              items={SUB_TABS.map((t) => ({ key: t.key, label: t.label }))}
              className={styles.tabs}
            />
            <div className={styles.dataList}>
              {loading ? (
                <p className={styles.dataPlaceholder}>加载中...</p>
              ) : items.length === 0 ? (
                <p className={styles.dataPlaceholder}>暂无订阅数据项，可在智能工具箱中点击「订阅」添加</p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className={styles.dataCard}>
                    <Checkbox
                      checked={checkedIds.includes(item.id)}
                      onChange={(e) => toggleCheck(item.id, e.target.checked)}
                    />
                    <div className={styles.dataMain}>
                      <div className={styles.dataTitleRow}>
                        <span className={styles.dataTag}>[{item.tag}]</span>
                        <span className={styles.dataTitle}>{item.title}</span>
                        <span className={styles.dataTime}>{item.timeLabel}</span>
                      </div>
                      <div className={styles.dataMeta}>{item.meta}</div>
                    </div>
                    <button
                      type="button"
                      className={styles.dataDelete}
                      onClick={() => void removeItem(item.id)}
                    >
                      删除
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={styles.rightPane}>
            {!generated ? (
              <div className={styles.emptyState}>
                <AnalyticsIcon className={styles.emptyIcon} />
                <p className={styles.emptyText}>请在左侧勾选需要分析的数据项</p>
                <Button
                  danger
                  type="primary"
                  size="large"
                  loading={generating}
                  icon={<AutoAwesomeIcon />}
                  onClick={handleGenerate}
                  className={styles.generateBtn}
                >
                  一键生成解决案例
                </Button>
              </div>
            ) : (
              <div className={styles.resultView}>
                <div className={styles.resultHeader}>
                  <div>
                    <h3 className={styles.resultTitle}>方案生成预览</h3>
                    <p className={styles.resultSub}>基于左侧勾选数据进行AI深度分析</p>
                  </div>
                  <Button
                    danger
                    type="primary"
                    loading={generating}
                    onClick={handleGenerate}
                    className={styles.generateBtnTop}
                  >
                    一键生成解决案例
                  </Button>
                </div>

                <Tabs
                  size="small"
                  activeKey={planTab}
                  onChange={setPlanTab}
                  items={PLAN_TABS.map((t) => ({ key: t.key, label: t.label }))}
                  className={styles.planTabs}
                />

                <div className={styles.planBody}>
                  <div className={styles.planText}>{PLAN_CONTENT[planTab]}</div>
                  <div className={styles.planActions}>
                    <Button
                      type="primary"
                      icon={<ReplyIcon />}
                      onClick={handleFillBack}
                    >
                      一键回填
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Drawer>

      <DraftModal
        open={draftOpen}
        ticketId={ticket.id}
        initialContent={draftPrefill}
        onClose={() => setDraftOpen(false)}
      />
    </>
  )
}
