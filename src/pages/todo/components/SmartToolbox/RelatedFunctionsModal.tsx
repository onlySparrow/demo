import { message } from 'antd'

import {
  BoltIcon,
  CrisisAlertIcon,
  DnsIcon,
  LandslideIcon,
  NotificationsActiveIcon,
  SettingsEthernetIcon,
  SettingsInputAntennaIcon,
  SignalCellularAltIcon,
  ThunderstormIcon,
  VisibilityIcon,
  WidgetsIcon,
} from '@/assets/icons'

import styles from './SmartToolbox.module.scss'

/** 关联功能完整列表（对齐功能清单） */
const RELATED_TOOLS = [
  {
    key: 'cell',
    label: '小区状态',
    desc: '查询关联的小区网络情况。',
    Icon: SignalCellularAltIcon,
  },
  {
    key: 'site',
    label: '基站状态',
    desc: '查询关联的基站网络情况。',
    Icon: DnsIcon,
  },
  {
    key: 'nearby',
    label: '附近故障',
    desc: '查看当前工单所在位置周边是否存在其他故障工单，辅助判断是否存在多点关联故障或区域性网络问题。',
    Icon: CrisisAlertIcon,
  },
  {
    key: 'siteAlarm',
    label: '基站告警',
    desc: '查询关联基站的活动告警与历史告警信息。',
    Icon: NotificationsActiveIcon,
  },
  {
    key: 'power',
    label: '电网检修',
    desc: '查询当前工单区域内的电网检修计划。',
    Icon: BoltIcon,
  },
  {
    key: 'wireless',
    label: '无线随心看',
    desc: '查看无线网络覆盖可视化信息。',
    Icon: VisibilityIcon,
  },
  {
    key: 'earthquake',
    label: '地震信息',
    desc: '查询最新地震活动信息。',
    Icon: LandslideIcon,
  },
  {
    key: 'weather',
    label: '灾害天气',
    desc: '查询当前区域灾害性天气预警信息，提前预判极端天气对网络运行的风险。',
    Icon: ThunderstormIcon,
  },
  {
    key: 'rru',
    label: 'RRU配置',
    desc: '查询关联的RRU/RFU设备配置参数及运行状态，辅助排查无线侧硬件问题。',
    Icon: SettingsInputAntennaIcon,
  },
  {
    key: 'optic',
    label: '光电模块',
    desc: '查询关联的光模块/电模块信息，包括型号、速率、波长、光功率等关键参数。',
    Icon: SettingsEthernetIcon,
  },
]

/**
 * 关联功能面板 —— 贴在工具箱左侧弹出，列表卡片样式
 */
export function RelatedFunctionsPanel({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div className={styles.relatedPanel} role="dialog" aria-label="关联功能">
      <header className={styles.relatedHeader}>
        <span className={styles.relatedHeaderTitle}>
          <WidgetsIcon className={styles.relatedHeaderIcon} />
          关联功能
        </span>
        <button type="button" className={styles.relatedClose} onClick={onClose} aria-label="关闭">
          ×
        </button>
      </header>
      <div className={styles.relatedList}>
        {RELATED_TOOLS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={styles.relatedItem}
            onClick={() => message.info(`${t.label}功能开发中（演示）`)}
          >
            <span className={styles.relatedItemIcon}>
              <t.Icon />
            </span>
            <span className={styles.relatedItemText}>
              <span className={styles.relatedItemLabel}>{t.label}</span>
              <span className={styles.relatedItemDesc}>{t.desc}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
