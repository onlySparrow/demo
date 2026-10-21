/**
 * 图标注册表 —— 全部为本地 SVG,由 vite-plugin-svgr 在构建期编译成 React 组件。
 *
 * 两个特性(与图标字体行为一致,所以原样式可无缝迁移):
 * - 尺寸:`width/height = 1em`,即外层 font-size 决定图标大小;
 * - 颜色:`fill = currentColor`,着色完全交给 CSS 的 color。
 *
 * 命名 = 原型里的 ligature 名转大驼峰 + Icon 后缀(settings_input_antenna → SettingsInputAntennaIcon);
 * `filled/` 下是实心变体(FILL 1),对应原来 `MaterialIcon` 的 filled 属性。
 * 图标含义对照见 doc/统一待办-PC端0727(1).html。
 */

/* ---------- 线性(默认) ---------- */
export { default as AddTaskIcon } from './material-symbols/add_task.svg?react'
export { default as AnalyticsIcon } from './material-symbols/analytics.svg?react'
export { default as AppsIcon } from './material-symbols/apps.svg?react'
export { default as AssignmentIcon } from './material-symbols/assignment.svg?react'
export { default as AttachFileIcon } from './material-symbols/attach_file.svg?react'
export { default as AutoAwesomeIcon } from './material-symbols/auto_awesome.svg?react'
export { default as BoltIcon } from './material-symbols/bolt.svg?react'
export { default as CableIcon } from './material-symbols/cable.svg?react'
export { default as CellTowerIcon } from './material-symbols/cell_tower.svg?react'
export { default as CloseIcon } from './material-symbols/close.svg?react'
export { default as ConstructionIcon } from './material-symbols/construction.svg?react'
export { default as CrisisAlertIcon } from './material-symbols/crisis_alert.svg?react'
export { default as DatabaseIcon } from './material-symbols/database.svg?react'
export { default as DnsIcon } from './material-symbols/dns.svg?react'
export { default as DraftsIcon } from './material-symbols/drafts.svg?react'
export { default as EngineeringIcon } from './material-symbols/engineering.svg?react'
export { default as ExpandLessIcon } from './material-symbols/expand_less.svg?react'
export { default as ExpandMoreIcon } from './material-symbols/expand_more.svg?react'
export { default as FilterListIcon } from './material-symbols/filter_list.svg?react'
export { default as FolderZipIcon } from './material-symbols/folder_zip.svg?react'
export { default as HistoryEduIcon } from './material-symbols/history_edu.svg?react'
export { default as HubIcon } from './material-symbols/hub.svg?react'
export { default as ImageIcon } from './material-symbols/image.svg?react'
export { default as InboxIcon } from './material-symbols/inbox.svg?react'
export { default as KeyboardArrowDownIcon } from './material-symbols/keyboard_arrow_down.svg?react'
export { default as LandslideIcon } from './material-symbols/landslide.svg?react'
export { default as LocationOffIcon } from './material-symbols/location_off.svg?react'
export { default as LocationOnIcon } from './material-symbols/location_on.svg?react'
export { default as LogoutIcon } from './material-symbols/logout.svg?react'
export { default as MarkEmailReadIcon } from './material-symbols/mark_email_read.svg?react'
export { default as MarkEmailUnreadIcon } from './material-symbols/mark_email_unread.svg?react'
export { default as MonitoringIcon } from './material-symbols/monitoring.svg?react'
export { default as NotificationsIcon } from './material-symbols/notifications.svg?react'
export { default as NotificationsActiveIcon } from './material-symbols/notifications_active.svg?react'
export { default as PendingActionsIcon } from './material-symbols/pending_actions.svg?react'
export { default as PersonIcon } from './material-symbols/person.svg?react'
export { default as PhoneInTalkIcon } from './material-symbols/phone_in_talk.svg?react'
export { default as PieChartIcon } from './material-symbols/pie_chart.svg?react'
export { default as PinDropIcon } from './material-symbols/pin_drop.svg?react'
export { default as ReceiptLongIcon } from './material-symbols/receipt_long.svg?react'
export { default as ReplyIcon } from './material-symbols/reply.svg?react'
export { default as ReportIcon } from './material-symbols/report.svg?react'
export { default as RouterIcon } from './material-symbols/router.svg?react'
export { default as ScheduleIcon } from './material-symbols/schedule.svg?react'
export { default as SearchIcon } from './material-symbols/search.svg?react'
export { default as SendIcon } from './material-symbols/send.svg?react'
export { default as SensorsIcon } from './material-symbols/sensors.svg?react'
export { default as SettingsEthernetIcon } from './material-symbols/settings_ethernet.svg?react'
export { default as SettingsInputAntennaIcon } from './material-symbols/settings_input_antenna.svg?react'
export { default as SignalCellularAltIcon } from './material-symbols/signal_cellular_alt.svg?react'
export { default as SortIcon } from './material-symbols/sort.svg?react'
export { default as StorageIcon } from './material-symbols/storage.svg?react'
export { default as SupportAgentIcon } from './material-symbols/support_agent.svg?react'
export { default as TableChartIcon } from './material-symbols/table_chart.svg?react'
export { default as TaskAltIcon } from './material-symbols/task_alt.svg?react'
export { default as ThunderstormIcon } from './material-symbols/thunderstorm.svg?react'
export { default as TimerIcon } from './material-symbols/timer.svg?react'
export { default as TodayIcon } from './material-symbols/today.svg?react'
export { default as VisibilityIcon } from './material-symbols/visibility.svg?react'
export { default as WarningIcon } from './material-symbols/warning.svg?react'
export { default as WidgetsIcon } from './material-symbols/widgets.svg?react'

/* ---------- 实心(FILL 1) ---------- */
export { default as CellTowerFillIcon } from './material-symbols/filled/cell_tower.svg?react'
export { default as SmartToyFillIcon } from './material-symbols/filled/smart_toy.svg?react'
