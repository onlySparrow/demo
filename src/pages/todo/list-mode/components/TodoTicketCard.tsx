import type { ComponentType, ReactNode, SVGProps } from 'react'

import {
  AppsIcon,
  CableIcon,
  CellTowerIcon,
  ConstructionIcon,
  DatabaseIcon,
  HubIcon,
  SensorsIcon,
  SettingsInputAntennaIcon,
  SupportAgentIcon,
} from '@/assets/icons'
import { PRIORITY_LABEL } from '@/pages/todo/config'

import styles from './TodoTicketCard.module.scss'

/** 流程历史节点 */
export interface TodoFlowNode {
  /** 节点标题，如「由 监控二组 发起派单」 */
  title: string
  /** 时间文案 */
  time: string
  /** 意见 / 备注 */
  note?: string
  /** completed=已完成当前节点; current=当前环节 */
  status: 'completed' | 'current'
}

/** 现场处理记录条目(详情「现场处理记录」卡片) */
export interface TodoSiteRecord {
  /** 步骤名,如「到场签到」 */
  title: string
  /** 时间文案 */
  time: string
  /** 处理说明 */
  note?: string
}

/** 关联告警条目(详情「关联告警」表格) */
export interface TodoRelatedAlarm {
  /** 激活 / 已恢复 */
  status: string
  /** 告警名称 */
  name: string
  /** 告警对象(站点/设备) */
  object: string
  /** 发生时间 */
  time: string
}

/** 附件条目(详情「附件与现场照片」) */
export interface TodoAttachment {
  /** 文件名(含扩展名) */
  name: string
  /** 类型文案:图片 / 日志 / 表格... */
  type?: string
  /** 大小文案,如「2.4 MB」 */
  size?: string
}

/** 操作日志条目(详情「操作日志」) */
export interface TodoOpLog {
  /** 时间文案 */
  time: string
  /** 操作人(系统/班组/人名) */
  operator: string
  /** 动作描述 */
  action: string
}

/** 待办工单数据 —— 列表卡片 + 详情字段（与原型 12 基础字段对齐） */
export interface TodoTicket {
  id: string
  title: string
  /** 优先级:决定卡片左边条与优先级标签颜色 */
  priority: '高' | '中' | '低'
  /** 所属应用(来源系统) */
  app: string
  /** 派发时间 */
  time: string
  /** 提报人(工单创建人,不随转派变化;接口未下发时显示 --) */
  creator?: string
  /** 处理人 */
  assignee?: string
  /** 处理状态 */
  status?: string
  /** 工单编号 */
  ticketNo?: string
  /** 处理时限 */
  deadline?: string
  /** 剩余处理时长文案(接口下发:「18h」「1天 6h」「已超时 Xh」;未下发显示 -) */
  remainingTime?: string
  /** 剩余处理小时数(接口下发,已超时为负;供 SLA 徽章/紧急色判定) */
  remainingHours?: number | null
  /** 部门 / 来源组织 */
  department?: string
  /** 网络工单号 */
  netTicketNo?: string
  /** 工单类型 */
  ticketType?: string
  /** 故障分类 */
  faultType?: string
  /** SLA 级别 */
  slaLevel?: string
  /** 站点名称 */
  siteName?: string
  /** 站点 ID */
  siteId?: string
  /** 省/市 */
  province?: string
  /** 区县 */
  district?: string
  /** 具体地址 */
  address?: string
  /** 基站厂家 */
  vendor?: string
  /** 告警名称 */
  alarmName?: string
  /** 关联告警数 */
  alarmCount?: string
  /** 工单描述(创建时填写,详情展示) */
  description?: string
  /** 影响用户数(详情「故障现象与影响范围」,后端未下发时显「--」) */
  impactUsers?: string
  /** 影响小区数(同上) */
  impactCells?: string
  /** 业务类型(同上) */
  businessType?: string
  /** 影响区域(同上) */
  impactArea?: string
  /** 现场处理记录(详情「现场处理记录」卡片,后端未下发时显「暂无数据」) */
  siteRecords?: TodoSiteRecord[]
  /** 关联告警列表(详情「关联告警」表格) */
  relatedAlarms?: TodoRelatedAlarm[]
  /** 附件与现场照片列表 */
  attachments?: TodoAttachment[]
  /** 操作日志列表 */
  opLogs?: TodoOpLog[]
  /** 经度(百度 BD09 坐标) —— 地图模式定位使用,与列表模式同接口返回 */
  lng?: number
  /** 纬度(百度 BD09 坐标) —— 地图模式定位使用,与列表模式同接口返回 */
  lat?: number
  /** 拟稿派单流程历史 */
  flow?: TodoFlowNode[]
}

/** 优先级 → 卡片左边条颜色 */
const PRIORITY_BORDER: Record<TodoTicket['priority'], string> = {
  高: styles.borderHigh,
  中: styles.borderMid,
  低: styles.borderLow,
}

/** 优先级 → 标签底色 */
const PRIORITY_BADGE: Record<TodoTicket['priority'], string> = {
  高: styles.badgeHigh,
  中: styles.badgeMid,
  低: styles.badgeLow,
}

/** 来源系统 → 图标组件（对齐原型） */
const SOURCE_ICON: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  网络运营监控室: CellTowerIcon,
  动环监控系统: SensorsIcon,
  资源系统同步: DatabaseIcon,
  核心网监控: HubIcon,
  客户中心: SupportAgentIcon,
  建设部门: ConstructionIcon,
  传输网络部: CableIcon,
  无线优化中心: SettingsInputAntennaIcon,
}

/** 取来源图标,未登记的系统统一落到 apps */
function getSourceIcon(app: string): ComponentType<SVGProps<SVGSVGElement>> {
  return SOURCE_ICON[app] || AppsIcon
}

/**
 * 待办工单卡片(信息布局对齐设计图):
 * 行1 工单来源;行2 工单编号(左) / 工单发起时间(右);
 * 行3 剩余处理时长(左) / 提报人(右)。优先级文案:高/中/低。
 * selected / active 控制浅蓝高亮（#e8f0fe）。
 */
export function TodoTicketCard({
  ticket,
  checkbox,
  selected,
  active,
  onClick,
}: {
  ticket: TodoTicket
  checkbox?: ReactNode
  /** 多选勾选态高亮 */
  selected?: boolean
  /** 当前查看详情的激活态高亮 */
  active?: boolean
  onClick?: () => void
}) {
  const highlighted = Boolean(selected || active)
  /** 剩余处理时长(接口下发文案,如「18h」「1天 6h」),未下发显示 -- */
  const remaining = ticket.remainingTime ?? null
  /** 来源系统对应图标(组件,需大写变量名才能作为 JSX 标签渲染) */
  const SourceIcon = getSourceIcon(ticket.app)

  return (
    <div
      className={`${styles.card} ${PRIORITY_BORDER[ticket.priority]} ${highlighted ? styles.cardSelected : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      <div className={styles.titleRow}>
        {checkbox}
        <span className={styles.title} title={ticket.title}>
          {ticket.title}
        </span>
        <span className={`${styles.priority} ${PRIORITY_BADGE[ticket.priority]}`}>
          {PRIORITY_LABEL[ticket.priority] ?? ticket.priority}
        </span>
      </div>

      {/* 行1:工单来源 */}
      <div className={styles.metaRow}>
        <span className={styles.source}>
          <SourceIcon className={styles.sourceIcon} />
          <span>{ticket.app}</span>
        </span>
      </div>

      {/* 行2:工单编号(左) / 工单发起时间(右) */}
      <div className={`${styles.metaRow} ${styles.metaRowSpread}`}>
        <span>{ticket.ticketNo || '--'}</span>
        <span>工单发起时间: {ticket.time}</span>
      </div>

      {/* 行3:剩余处理时长(左,警示棕) / 提报人(右) */}
      <div className={`${styles.metaRow} ${styles.metaRowSpread}`}>
        <span
          className={styles.remaining}
          title={ticket.deadline ? `处理时限: ${ticket.deadline}` : undefined}
        >
          剩余处理时长: {remaining ?? '--'}
        </span>
        <span>提报人: {ticket.creator || '--'}</span>
      </div>
    </div>
  )
}
