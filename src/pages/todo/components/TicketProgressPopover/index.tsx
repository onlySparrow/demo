import { Popover } from 'antd'
import type { ReactNode } from 'react'
import { useMemo } from 'react'

import type { TodoTicket } from '../../list-mode/components/TodoTicketCard'

import styles from './index.module.scss'

/** 标准流程六阶段(原型「工单进度详情」时间线) */
const PROGRESS_STAGES = ['发起派单', '待接单', '现场处理', '复测验证', '待审核', '已归档'] as const

/** 各阶段在流程历史标题里的关键词(把后端 flow 节点对齐到标准阶段) */
const STAGE_FLOW_PATTERNS: RegExp[] = [
  /发起|派单|拟稿/,
  /接单/,
  /现场|转派|处理/,
  /复测|验证/,
  /审核/,
  /归档|办结|闭环/,
]

/** 工单状态 → 当前阶段序号(待办工单多为「处理中」=现场处理环节) */
function getStageIndexByStatus(status?: string): number {
  const text = status ?? ''
  if (/待接单/.test(text)) return 1
  if (/复测|验证/.test(text)) return 3
  if (/审核/.test(text)) return 4
  if (/归档|办结|闭环|已办/.test(text)) return 5
  return 2
}

/** 时间文案是否为真实时间戳(流程节点可能带「当前环节」等非时间文案) */
function isTimestamp(text?: string): boolean {
  return /\d{4}-\d{2}-\d{2}/.test(text ?? '')
}

/** 从流程节点标题提取处理人/班组(如「由 监控二组 发起派单」→「监控二组」) */
function extractFlowHandler(title: string): string | null {
  const cleaned = title.replace(/^[由待]\s*/, '').replace(/(发起派单|处理|接单|审核|复测|归档|办结)\s*$/, '')
  return cleaned.trim() || null
}

interface ProgressStage {
  name: string
  handler: string
  time: string
  state: 'done' | 'current' | 'pending'
}

/**
 * 由工单数据推导六阶段进度:
 * 阶段序号与状态映射定先后;后端 flow 节点按关键词对齐补充各阶段处理人/时间,
 * 无数据的已完成阶段显「--」;发起派单兜底取来源班组与发起时间,现场处理取当前处理人。
 */
export function buildProgressStages(ticket: TodoTicket): ProgressStage[] {
  const current = getStageIndexByStatus(ticket.status)
  const flow = ticket.flow ?? []
  return PROGRESS_STAGES.map((name, idx) => {
    const matched = [...flow].reverse().find((node) => STAGE_FLOW_PATTERNS[idx].test(node.title))
    const matchedHandler = matched ? extractFlowHandler(matched.title) : null

    let handler: string
    if (idx === 0) {
      // 发起派单=派单班组:优先流程历史(「由 监控二组 发起派单」→监控二组),兜底工单来源
      handler = matchedHandler || ticket.app || '--'
    } else if (idx === 2 || (idx === current && idx >= 3 && idx < 5)) {
      handler = ticket.assignee || '--'
    } else {
      handler = matchedHandler || '--'
    }

    const time = isTimestamp(matched?.time ?? '')
      ? (matched?.time ?? '--')
      : idx === 0
        ? (ticket.time || '--')
        : '--'

    const state: ProgressStage['state'] =
      idx < current ? 'done' : idx === current ? 'current' : 'pending'
    return { name, handler, time, state }
  })
}

/**
 * 工单进度详情弹层(共用)——点击状态徽章/标签展示历史处理节点时间线及当前处理人。
 * 列表模式详情面板与地图模式详情大弹窗共用:children 即触发元素。
 */
export function TicketProgressPopover({
  ticket,
  children,
  placement = 'bottomRight',
}: {
  ticket: TodoTicket
  /** 触发元素(状态徽章 / 状态标签) */
  children: ReactNode
  /** 弹出位置,默认右下 */
  placement?: 'bottomLeft' | 'bottomRight' | 'bottom' | 'topLeft' | 'topRight' | 'top'
}) {
  /** 六阶段:已完成绿点/当前蓝环/未到灰圈,当前处理人随当前环节展示 */
  const progressStages = useMemo(() => buildProgressStages(ticket), [ticket])

  const content = (
    <div className={styles.progressPanel}>
      <div className={styles.progressHeader}>工单进度详情</div>
      <div className={styles.progressTimeline}>
        {progressStages.map((stage) => (
          <div key={stage.name} className={styles.progressNode} data-state={stage.state}>
            <span className={styles.progressDot} />
            <div className={styles.progressContent}>
              <p className={styles.progressTitle}>{stage.name}</p>
              <p className={styles.progressHandler}>
                {stage.state === 'pending' ? '进行中...' : `${stage.name} ${stage.handler}`}
              </p>
              <p className={styles.progressTime}>{stage.state === 'pending' ? '--' : stage.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <Popover
      content={content}
      trigger="click"
      placement={placement}
      arrow={false}
      styles={{ content: { padding: 0 } }}
    >
      {children}
    </Popover>
  )
}
