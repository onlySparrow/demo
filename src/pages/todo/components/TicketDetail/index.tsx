import { Button } from 'antd'
import { useState } from 'react'
import type { ComponentType } from 'react'

import {
  AttachFileIcon,
  CloseIcon,
  EngineeringIcon,
  ExpandLessIcon,
  ExpandMoreIcon,
  FolderZipIcon,
  HistoryEduIcon,
  ImageIcon,
  LocationOnIcon,
  NotificationsActiveIcon,
  ReceiptLongIcon,
  ReportIcon,
  ScheduleIcon,
  TableChartIcon,
} from '@/assets/icons'

import { buildProgressStages, TicketProgressPopover } from '../TicketProgressPopover'
import { PRIORITY_LABEL } from '../../config'
import { SiteMapModal } from '../../list-mode/components/SiteMapModal'
import { TransferModal } from '../../list-mode/components/TransferModal'
import type { TodoTicket } from '../../list-mode/components/TodoTicketCard'

import styles from './index.module.scss'

/**
 * 详情 16 基础字段(与新原型一致):
 * 前 12 项直取工单字段;后 4 项(紧急程度/工单编号/当前处理人/派单时间)
 * 由列表数据映射 —— 紧急程度直接展示 高/中/低。
 */
const DETAIL_FIELDS: {
  key: keyof TodoTicket
  label: string
  text?: (t: TodoTicket) => string | undefined
}[] = [
  { key: 'netTicketNo', label: '网络工单号' },
  { key: 'ticketType', label: '工单类型' },
  { key: 'faultType', label: '故障分类' },
  { key: 'slaLevel', label: 'SLA级别' },
  { key: 'siteName', label: '站点名称' },
  { key: 'siteId', label: '站点ID' },
  { key: 'province', label: '省/市' },
  { key: 'district', label: '区县' },
  { key: 'address', label: '具体地址' },
  { key: 'vendor', label: '基站厂家' },
  { key: 'alarmName', label: '告警名称' },
  { key: 'alarmCount', label: '关联告警数' },
  { key: 'priority', label: '紧急程度', text: (t) => PRIORITY_LABEL[t.priority] ?? t.priority },
  { key: 'ticketNo', label: '工单编号' },
  { key: 'assignee', label: '当前处理人' },
  { key: 'time', label: '派单时间' },
]

/** 工单总耗时:发起时间至今的时长(不足 1 天按小时,超 1 天按 x天 xh),解析失败返回 null */
function getElapsedSince(time?: string): string | null {
  if (!time) return null
  const start = new Date(time.replace(/-/g, '/')).getTime()
  if (Number.isNaN(start)) return null
  const hours = Math.max(0, Math.floor((Date.now() - start) / 3_600_000))
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}天 ${hours % 24}h`
}

/** 附件类型 → 图标(图片/日志/表格,其余用通用附件图标) */
function getFileIcon(type?: string): ComponentType<{ className?: string }> {
  if (type === '图片') return ImageIcon
  if (type === '日志') return FolderZipIcon
  if (type === '表格') return TableChartIcon
  return AttachFileIcon
}

/**
 * 工单详情内容(共用)—— 列表模式右侧面板与地图模式详情弹窗同一套渲染:
 * 顶栏 + 16字段网格 + 处理时效 + 故障现象与影响范围 + 处理流转记录 +
 * 现场处理记录 + 关联告警 + 附件与现场照片 + 操作日志 + 底栏操作(转派)。
 *
 * 差异化参数:列表模式展示站点缩略图(showMiniMap,默认开),地图模式已在地图上不展示、
 * 改传 onClose 在顶栏渲染关闭按钮。
 */
export function TicketDetail({
  ticket,
  onTicketUpdate,
  showMiniMap = true,
  onClose,
}: {
  ticket: TodoTicket
  /** 转派等操作成功后回传流转信息已更新的工单,由外层同步列表 */
  onTicketUpdate?: (ticket: TodoTicket) => void
  /** 站点缩略图(点击打开站点位置大图):列表模式展示,地图模式不展示 */
  showMiniMap?: boolean
  /** 顶栏右上角关闭回调(地图模式弹窗传入);不传则不渲染关闭按钮 */
  onClose?: () => void
}) {
  const [transferOpen, setTransferOpen] = useState(false)
  const [flowCollapsed, setFlowCollapsed] = useState(false)
  /** 站点位置弹窗(点击缩略图打开,不再跳转地图模式) */
  const [siteMapOpen, setSiteMapOpen] = useState(false)

  /** 剩余处理小时数(接口下发,已超时为负):≤3h(含超时)详情头剩余时长标紧急色 */
  const remainingHours = ticket.remainingHours ?? null
  const deadlineOverdue = remainingHours != null && remainingHours <= 3

  /** 剩余时长展示值(接口下发文案,未下发显示 --);SLA 徽章:剩余 ≤0 超时,>0 达标,无时限不显示 */
  const remaining = ticket.remainingTime ?? null
  const slaState: 'ok' | 'overdue' | null =
    remainingHours == null ? null : remainingHours <= 0 ? 'overdue' : 'ok'

  /** 六阶段进度(与工单进度弹层同源推导):当前环节、流转百分比与阶段条都取自它 */
  const stages = buildProgressStages(ticket)
  const currentStageName = stages.find((s) => s.state === 'current')?.name ?? '--'
  const progressPercent = Math.round(
    ((stages.findIndex((s) => s.state === 'current') + 1) / stages.length) * 100,
  )
  const elapsed = getElapsedSince(ticket.time) ?? '--'

  const flow = ticket.flow?.length
    ? ticket.flow
    : [
        {
          title: `由 ${ticket.app} 发起派单`,
          time: ticket.time || '--',
          note: ticket.title,
          status: 'completed' as const,
        },
        {
          title: `待 ${ticket.assignee || '处理人'} 处理`,
          time: '当前环节',
          status: 'current' as const,
        },
      ]

  return (
    <div className={styles.detail}>
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <div className={styles.titleRow}>
            <h2 className={styles.title} title={ticket.title}>
              {ticket.title}
            </h2>
            <TicketProgressPopover ticket={ticket}>
              <button type="button" className={styles.statusBadge}>
                {ticket.status || '处理中'}
              </button>
            </TicketProgressPopover>
          </div>
          {/* 标题下方信息:6 项一行 3 个(编号/来源/当前处理人/提报人/剩余时长/总耗时) */}
          <div className={styles.metaGrid}>
            <div>
              <span className={styles.metaLabel}>工单编号:</span>
              <span className={styles.mono}>{ticket.ticketNo || '--'}</span>
            </div>
            <div>
              <span className={styles.metaLabel}>工单来源:</span>
              <span>{ticket.app || '--'}</span>
            </div>
            <div>
              <span className={styles.metaLabel}>当前处理人:</span>
              <span>{ticket.assignee || '--'}</span>
            </div>
            <div>
              <span className={styles.metaLabel}>提报人:</span>
              <span>{ticket.creator || '--'}</span>
            </div>
            <div>
              <span className={styles.metaLabel}>剩余处理时长:</span>
              <span className={deadlineOverdue ? styles.deadlineUrgent : styles.deadline}>
                {remaining ?? '--'}
              </span>
            </div>
            <div>
              <span className={styles.metaLabel}>工单总耗时:</span>
              <span>{getElapsedSince(ticket.time) ?? '--'}</span>
            </div>
          </div>
        </div>
        {showMiniMap && (
          <button
            type="button"
            className={styles.miniMap}
            title="查看站点位置"
            onClick={() => setSiteMapOpen(true)}
          >
            <div className={styles.miniMapGrid} />
            <LocationOnIcon className={styles.miniMapPin} />
            <span className={styles.miniMapLabel}>{ticket.siteName || '站点'}</span>
          </button>
        )}
        {onClose && (
          <button type="button" className={styles.closeBtn} onClick={onClose} title="关闭">
            <CloseIcon />
          </button>
        )}
      </header>

      {/* 站点位置弹窗:顶部站点信息 + 真实地图(故障点/距用户距离) + 详细地址 + 关闭 */}
      {showMiniMap && (
        <SiteMapModal open={siteMapOpen} ticket={ticket} onClose={() => setSiteMapOpen(false)} />
      )}

      <div className={styles.body}>
        <section>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionBar} />
            <h3>工单详细信息</h3>
          </div>
          <div className={styles.fieldGrid}>
            {DETAIL_FIELDS.map(({ key, label, text }) => (
              <div key={key} className={styles.fieldItem}>
                <p className={styles.fieldLabel}>{label}</p>
                <p className={styles.fieldValue}>
                  {(text?.(ticket) ?? (ticket[key] as string)) || '--'}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 处理时效:4 项时效指标 + 流转进度(阶段条与百分比,同六阶段推导) + 底部汇总 */}
        <section className={styles.infoCard}>
          <div className={styles.infoCardHeader}>
            <ScheduleIcon className={styles.infoCardIcon} />
            <h4>处理时效</h4>
          </div>
          <div className={styles.infoCardBody}>
            <div className={styles.slaStatGrid}>
              <div className={styles.slaStat}>
                <p className={styles.slaStatLabel}>当前处理环节</p>
                <p className={styles.slaStatValue} title={currentStageName}>
                  {currentStageName}
                </p>
              </div>
              <div className={styles.slaStat}>
                <p className={styles.slaStatLabel}>当前处理人</p>
                <p className={styles.slaStatValue} title={ticket.assignee ?? '--'}>
                  {ticket.assignee ?? '--'}
                </p>
              </div>
              <div className={styles.slaStat}>
                <p className={styles.slaStatLabel}>已处理时长</p>
                <p className={styles.slaStatValue} title={elapsed}>
                  {elapsed}
                </p>
              </div>
              <div className={styles.slaStat}>
                <p className={styles.slaStatLabel}>剩余处理时限</p>
                <p className={styles.slaStatValue} title={remaining ?? '--'}>
                  {remaining ?? '--'}
                </p>
              </div>
            </div>

            <div className={styles.slaProgressBlock}>
              <div className={styles.slaProgressHeader}>
                <span className={styles.slaProgressLabel}>流转进度</span>
                <span className={styles.slaProgressMeta}>
                  {slaState && (
                    <span
                      className={
                        slaState === 'overdue' ? styles.slaBadgeOverdue : styles.slaBadgeOk
                      }
                    >
                      {slaState === 'overdue' ? 'SLA 超时' : 'SLA 达标'}
                    </span>
                  )}
                  <span className={styles.slaPercent}>{progressPercent}%</span>
                </span>
              </div>
              <div className={styles.slaProgressBar}>
                <div className={styles.slaProgressFill} style={{ width: `${progressPercent}%` }} />
              </div>
              <div className={styles.slaStageStrip}>
                {stages.map((stage) => (
                  <div key={stage.name} className={styles.slaStage} data-state={stage.state}>
                    <span className={styles.slaStageDot} />
                    <span className={styles.slaStageName}>{stage.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.slaFooter}>
              <div>
                <span className={styles.slaFooterLabel}>工单总耗时：</span>
                <span className={styles.slaFooterValue}>{elapsed}</span>
              </div>
              <div>
                <span className={styles.slaFooterLabel}>派单时间：</span>
                <span className={styles.slaFooterValue}>{ticket.time || '--'}</span>
              </div>
              <div>
                <span className={styles.slaFooterLabel}>时限要求：</span>
                <span className={`${styles.slaFooterValue} ${styles.slaFooterError}`}>
                  {ticket.slaLevel || '--'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 故障现象与影响范围:工单描述 + 4 项影响指标(后端未下发时显「--」) */}
        <section className={styles.infoCard}>
          <div className={styles.infoCardHeader}>
            <ReportIcon className={styles.infoCardIcon} />
            <h4>故障现象与影响范围</h4>
          </div>
          <div className={styles.infoCardBody}>
            <p className={styles.faultDesc}>{ticket.description || '--'}</p>
            <div className={styles.faultStatGrid}>
              <div className={styles.faultStat}>
                <p className={styles.faultStatLabel}>影响用户数</p>
                <p className={styles.faultStatValue} title={ticket.impactUsers || '--'}>
                  {ticket.impactUsers || '--'}
                </p>
              </div>
              <div className={styles.faultStat}>
                <p className={styles.faultStatLabel}>影响小区数</p>
                <p className={styles.faultStatValue} title={ticket.impactCells || '--'}>
                  {ticket.impactCells || '--'}
                </p>
              </div>
              <div className={styles.faultStat}>
                <p className={styles.faultStatLabel}>业务类型</p>
                <p className={styles.faultStatValue} title={ticket.businessType || '--'}>
                  {ticket.businessType || '--'}
                </p>
              </div>
              <div className={styles.faultStat}>
                <p className={styles.faultStatLabel}>影响区域</p>
                <p className={styles.faultStatValue} title={ticket.impactArea || '--'}>
                  {ticket.impactArea || '--'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.flowSection}>
          <button
            type="button"
            className={styles.flowHeader}
            onClick={() => setFlowCollapsed((v) => !v)}
          >
            <span className={styles.flowHeaderLeft}>
              <HistoryEduIcon className={styles.flowIcon} />
              <h4>处理流转记录</h4>
            </span>
            {flowCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </button>
          {!flowCollapsed && (
            <div className={styles.timeline}>
              {flow.map((node, idx) => (
                <div key={idx} className={styles.timelineItem}>
                  <span
                    className={
                      node.status === 'current' ? styles.dotCurrent : styles.dotCompleted
                    }
                  />
                  <div className={styles.timelineContent}>
                    <p className={styles.timelineTitle}>{node.title}</p>
                    <p className={styles.timelineTime}>{node.time}</p>
                    {node.note && <p className={styles.timelineNote}>{node.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 现场处理记录:编号步骤列表(后端未下发时显「暂无数据」) */}
        <section className={styles.infoCard}>
          <div className={styles.infoCardHeader}>
            <EngineeringIcon className={styles.infoCardIcon} />
            <h4>现场处理记录</h4>
          </div>
          <div className={styles.infoCardBody}>
            {ticket.siteRecords?.length ? (
              <div className={styles.siteRecords}>
                {ticket.siteRecords.map((record, idx) => (
                  <div key={idx} className={styles.siteRecordItem}>
                    <span className={styles.siteRecordNo}>{idx + 1}</span>
                    <div className={styles.siteRecordMain}>
                      <p className={styles.siteRecordTitleRow}>
                        <span className={styles.siteRecordTitle}>{record.title}</span>
                        <span className={styles.siteRecordTime}>{record.time}</span>
                      </p>
                      {record.note && <p className={styles.siteRecordNote}>{record.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>暂无数据</div>
            )}
          </div>
        </section>

        {/* 关联告警:状态/告警名称/告警对象/发生时间 表格 */}
        <section className={styles.infoCard}>
          <div className={styles.infoCardHeader}>
            <NotificationsActiveIcon className={styles.infoCardIcon} />
            <h4>关联告警</h4>
          </div>
          <div className={styles.infoCardBody}>
            {ticket.relatedAlarms?.length ? (
              <div className={styles.alarmTableWrap}>
                <table className={styles.alarmTable}>
                  <thead>
                    <tr>
                      <th>状态</th>
                      <th>告警名称</th>
                      <th>告警对象</th>
                      <th>发生时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ticket.relatedAlarms.map((alarm, idx) => (
                      <tr key={idx}>
                        <td
                          className={`${styles.alarmStatus} ${
                            alarm.status === '激活' ? styles.alarmActive : styles.alarmResolved
                          }`}
                        >
                          {alarm.status}
                        </td>
                        <td>{alarm.name}</td>
                        <td className={styles.alarmObject} title={alarm.object}>
                          {alarm.object}
                        </td>
                        <td className={styles.alarmTime}>{alarm.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.emptyState}>暂无数据</div>
            )}
          </div>
        </section>

        {/* 附件与现场照片:两列文件卡(类型决定图标,hover 主色描边) */}
        <section className={styles.infoCard}>
          <div className={styles.infoCardHeader}>
            <AttachFileIcon className={styles.infoCardIcon} />
            <h4>附件与现场照片</h4>
          </div>
          <div className={styles.infoCardBody}>
            {ticket.attachments?.length ? (
              <div className={styles.fileGrid}>
                {ticket.attachments.map((file, idx) => {
                  const FileIcon = getFileIcon(file.type)
                  return (
                    <div key={idx} className={styles.fileItem} title={file.name}>
                      <span className={styles.fileIcon}>
                        <FileIcon />
                      </span>
                      <div className={styles.fileMeta}>
                        <p className={styles.fileName}>{file.name}</p>
                        <p className={styles.fileType}>
                          {[file.type, file.size].filter(Boolean).join(' · ') || '--'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className={styles.emptyState}>暂无数据</div>
            )}
          </div>
        </section>

        {/* 操作日志:时间 / 操作人 / 动作 三段行 */}
        <section className={styles.infoCard}>
          <div className={styles.infoCardHeader}>
            <ReceiptLongIcon className={styles.infoCardIcon} />
            <h4>操作日志</h4>
          </div>
          <div className={styles.infoCardBody}>
            {ticket.opLogs?.length ? (
              <ul className={styles.logList}>
                {ticket.opLogs.map((log, idx) => (
                  <li key={idx} className={styles.logItem}>
                    <span className={styles.logTime}>{log.time}</span>
                    <span className={styles.logUser} title={log.operator}>
                      {log.operator}
                    </span>
                    <span className={styles.logAction}>{log.action}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.emptyState}>暂无数据</div>
            )}
          </div>
        </section>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerActions}>
          <Button
            className={`${styles.footerActionBtn} ${styles.transferBtn}`}
            onClick={() => setTransferOpen(true)}
          >
            转派
          </Button>
        </div>
      </footer>

      <TransferModal
        open={transferOpen}
        ticketId={ticket.id}
        onClose={() => setTransferOpen(false)}
        onSuccess={onTicketUpdate}
      />
    </div>
  )
}
