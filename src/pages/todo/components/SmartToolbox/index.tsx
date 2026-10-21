import {
  EnvironmentOutlined,
  InfoCircleOutlined,
  AppstoreOutlined,
  TeamOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { useState } from 'react'
import { useNavigate } from 'react-router'

import { SmartToyFillIcon } from '@/assets/icons'
import { routes } from '@/routes'

import { ActiveAlarmModal } from './ActiveAlarmModal'
import { ExpertCollabModal } from './ExpertCollabModal'
import { HistoryAlarmModal } from './HistoryAlarmModal'
import { RelatedFunctionsPanel } from './RelatedFunctionsModal'
import { XiaoQAssistant } from './XiaoQAssistant'

import styles from './SmartToolbox.module.scss'

export interface SmartToolboxProps {
  /** list：展示附近工单；map：隐藏附近工单 */
  mode: 'list' | 'map'
  /** 是否可见（如列表未选工单时可隐藏） */
  visible?: boolean
  /** 当前关联工单上下文 */
  ticketId?: string
  ticketTitle?: string
  ticketNo?: string
  siteName?: string
}

/**
 * 智能工具箱 —— 默认展开，可收起为机器人按钮
 * 功能：附近工单(仅列表) / 历史信息(活动·历史告警) / 关联功能 / 专家协同 / 小Q助手
 */
export function SmartToolbox({
  mode,
  visible = true,
  ticketId,
  ticketTitle,
  ticketNo,
  siteName,
}: SmartToolboxProps) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(true)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [activeAlarmOpen, setActiveAlarmOpen] = useState(false)
  const [historyAlarmOpen, setHistoryAlarmOpen] = useState(false)
  const [relatedOpen, setRelatedOpen] = useState(false)
  const [expertOpen, setExpertOpen] = useState(false)
  const [xiaoQOpen, setXiaoQOpen] = useState(false)

  if (!visible) return null

  const goNearbyTickets = () => {
    // 跳转地图模式，便于查看附近故障并规划路线
    navigate(`${routes.todo}?tab=map`)
  }

  if (!expanded) {
    return (
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setExpanded(true)}
        title="展开智能工具箱"
        aria-label="展开智能工具箱"
      >
        <SmartToyFillIcon className={styles.triggerIcon} />
      </button>
    )
  }

  return (
    <>
      <aside className={styles.panel} aria-label="智能工具箱">
        {mode === 'list' && (
          <button type="button" className={styles.item} onClick={goNearbyTickets}>
            <EnvironmentOutlined className={styles.itemIcon} />
            <span className={styles.itemLabel}>附近工单</span>
          </button>
        )}

         <div style={{ width: "100%" }}>
          <button
            type="button"
            className={styles.item}
            onClick={() => setHistoryOpen((v) => !v)}
          >
            <InfoCircleOutlined className={styles.itemIcon} />
            <span className={styles.itemLabel}>历史信息</span>
          </button>
          {historyOpen && (
            <div className={styles.subMenu}>
              <button
                type="button"
                className={styles.subItem}
                onClick={() => {
                  setActiveAlarmOpen(true)
                  setHistoryOpen(false)
                }}
              >
                活动告警
              </button>
              <button
                type="button"
                className={styles.subItem}
                onClick={() => {
                  setHistoryAlarmOpen(true)
                  setHistoryOpen(false)
                }}
              >
                历史告警
              </button>
            </div>
          )}
        </div>

        <button type="button" className={styles.item} onClick={() => setRelatedOpen(true)}>
          <AppstoreOutlined className={styles.itemIcon} />
          <span className={styles.itemLabel}>关联功能</span>
        </button>

        <button type="button" className={styles.item} onClick={() => setExpertOpen(true)}>
          <TeamOutlined className={styles.itemIcon} />
          <span className={styles.itemLabel}>专家协同</span>
        </button>

        <button
          type="button"
          className={`${styles.item} ${styles.itemHighlight}`}
          onClick={() => setXiaoQOpen(true)}
        >
          <SmartToyFillIcon className={styles.itemIcon} />
          <span className={styles.itemLabel}>小Q助手</span>
        </button>

        <div className={styles.divider} />

        <button
          type="button"
          className={styles.collapseBtn}
          onClick={() => setExpanded(false)}
          title="收起工具箱"
          aria-label="收起工具箱"
        >
          <RightOutlined />
        </button>
      </aside>

      <ActiveAlarmModal
        open={activeAlarmOpen}
        ticketId={ticketId}
        onClose={() => setActiveAlarmOpen(false)}
      />
      <HistoryAlarmModal
        open={historyAlarmOpen}
        ticketId={ticketId}
        ticketTitle={ticketTitle}
        onClose={() => setHistoryAlarmOpen(false)}
      />
      <RelatedFunctionsPanel open={relatedOpen} onClose={() => setRelatedOpen(false)} />
      <ExpertCollabModal
        open={expertOpen}
        ticketId={ticketId}
        ticketTitle={ticketTitle}
        ticketNo={ticketNo}
        siteName={siteName}
        onClose={() => setExpertOpen(false)}
      />
      <XiaoQAssistant
        open={xiaoQOpen}
        ticketId={ticketId}
        ticketTitle={ticketTitle}
        onClose={() => setXiaoQOpen(false)}
      />
    </>
  )
}
