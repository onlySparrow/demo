/**
 * 待办模块演示数据源（mock）—— 2026-10-13 起页面已切换真实接口 `@/api/todo`（部署用），
 * 本文件保留：本地无后端时把各页面 import 切回本文件即可恢复演示数据（函数同名同签名）。
 */
import dayjs from 'dayjs'

import type {
  BatchProcessTodoParams,
  FetchTodoListParams,
  TodoListResult,
  TodoTicket,
  TransferAssignee,
  TransferQuickReply,
  TransferTodoParams,
} from '../src/api/todo'

export type { TodoTicket, FetchTodoListParams, TodoListResult }
export type { TransferAssignee, TransferQuickReply } from '../src/api/todo'

/** 紧急程度字典 value → 中文 label(fetchTodoList 过滤与列表展示共用) */
export const PRIORITY_VALUE_TO_LABEL: Record<string, string> = {
  high: '高',
  mid: '中',
  low: '低',
  高: '高',
  中: '中',
  低: '低',
}

/** 来源系统字典 value → 中文 label(fetchTodoList 过滤与列表展示共用) */
export const SOURCE_VALUE_TO_LABEL: Record<string, string> = {
  network_ops: '网络运营监控室',
  power_monitor: '动环监控系统',
  resource_sync: '资源系统同步',
  core_net: '核心网监控',
  customer_center: '客户中心',
  construction: '建设部门',
  transmission: '传输网络部',
  wireless_opt: '无线优化中心',
}

/**
 * 待办工单模拟数据集（对齐原型字段，共 12 条）
 */
export const mockTickets: TodoTicket[] = [
  {
    id: 'TODO-001',
    creator: 'chinaunicom001',
    title: '【高铁督办工单】[衍生关联]LTE小区退出服务',
    priority: '高',
    app: '网络运营监控室',
    time: '2025-03-26 17:36',
    assignee: '张三',
    status: '处理中',
    ticketNo: 'WO-20250326-0042',
    netTicketNo: 'NET-LS-998273',
    ticketType: '故障抢修 - 高铁专项',
    faultType: '基站小区退出服务',
    slaLevel: '一级 (4小时响应)',
    siteName: '丽水南站G502',
    siteId: 'ZJ_LS_BS_0982',
    province: '浙江省丽水市',
    district: '莲都区',
    address: '丽水火车站站前路2号',
    vendor: '华为 (Huawei)',
    alarmName: 'Cell Unavailable',
    alarmCount: '12 条相关告警',
    deadline: '2025-03-27 12:00 (剩 18h)',
    department: '网络运营中心 - 丽水分部',
    description:
      '监控系统于 2025-03-26 17:36 上报「Cell Unavailable」告警，现场核查确认为 基站小区退出服务。初步判断为传输或电源侧异常，需现场更换部件后复测验证。',
    impactUsers: '1600 户',
    impactCells: '2 个',
    businessType: '高铁专网通信',
    impactArea: '莲都区 丽水南站G502 周边 2 公里',
    siteRecords: [
      {
        title: '到场签到',
        time: '2025-03-26 17:56',
        note: '运维人员到达 丽水南站G502，完成安全交底与现场拍照。',
      },
      {
        title: '故障定位',
        time: '2025-03-26 18:26',
        note: '使用OTDR/万用表排查，定位到 基站小区退出服务，确认非光缆侧问题。',
      },
      {
        title: '部件更换',
        time: '2025-03-26 19:36',
        note: '更换备用部件并复位，设备指示灯恢复正常。',
      },
    ],
    relatedAlarms: [
      { status: '激活', name: 'Cell Unavailable', object: '丽水南站G502', time: '2025-03-26 17:24' },
      { status: '激活', name: '基站退服告警', object: 'ZJ_LS_BS_0982', time: '2025-03-26 17:26' },
      { status: '已恢复', name: '传输链路误码越限', object: '杭州-丽水骨干链路', time: '2025-03-26 18:36' },
    ],
    attachments: [
      { name: '现场故障照片.jpg', type: '图片', size: '2.4 MB' },
      { name: '设备日志导出.zip', type: '日志', size: '860 KB' },
      { name: '基站参数核查表.xlsx', type: '表格', size: '45 KB' },
      { name: '处理前后对比截图.png', type: '图片', size: '1.1 MB' },
    ],
    opLogs: [
      { time: '2025-03-26 17:36', operator: '系统', action: '工单自动派发至 网络运营监控室' },
      { time: '2025-03-26 17:51', operator: '监控二组', action: '短信通知处理人并抄送班组长' },
      { time: '2025-03-26 18:08', operator: '张三', action: '接单并开始处理' },
      { time: '2025-03-26 19:40', operator: '张三', action: '暂存排查进展，上传现场照片 2 张' },
    ],
    flow: [
      {
        title: '由 监控二组 发起派单',
        time: '2025-03-26 17:30',
        note: '由于丽水南站小区退服，影响高铁G7331次列车通信质量，请立即核查。',
        status: 'completed',
      },
      {
        title: '待 丽水运维中心 处理',
        time: '当前环节',
        status: 'current',
      },
    ],
  },
  {
    id: 'TODO-002',
    creator: 'chinaunicom002',
    title: '基站电力中断报警 - 丽水中心枢纽',
    priority: '中',
    app: '动环监控系统',
    time: '2025-03-26 16:20',
    assignee: '李四',
    status: '处理中',
    ticketNo: 'WO-20250326-0055',
    netTicketNo: 'NET-DH-5521',
    ticketType: '动环抢修 - 电力系统',
    faultType: '市电中断 / UPS切换',
    slaLevel: '一级 (2小时响应)',
    siteName: '丽水中心枢纽',
    siteId: 'ZJ_LS_HUB_001',
    province: '浙江省丽水市',
    district: '莲都区',
    address: '丽水中心枢纽大楼B1配电间',
    vendor: '施耐德 (Schneider)',
    alarmName: 'Power Failure',
    alarmCount: '5 条相关告警',
    deadline: '2025-03-27 06:00 (剩 13h)',
    department: '动环维护中心',
    flow: [
      {
        title: '由 动环监控系统 自动派单',
        time: '2025-03-26 16:20',
        note: '检测到市电中断告警，自动派单。',
        status: 'completed',
      },
      {
        title: '李四 已接单',
        time: '2025-03-26 16:35',
        note: '正在联系供电局确认电网波动。',
        status: 'current',
      },
    ],
  },
  {
    id: 'TODO-003',
    creator: 'chinaunicom003',
    title: '资源勘察申请 - 丽水云和新区',
    priority: '低',
    app: '资源系统同步',
    time: '2025-03-26 15:10',
    assignee: '王五',
    status: '处理中',
    ticketNo: 'WO-20250326-0072',
    netTicketNo: 'NET-ZY-YH-4402',
    ticketType: '资源管理 - 勘察调度',
    faultType: '新建站点资源勘察',
    slaLevel: '三级 (24小时响应)',
    siteName: '丽水云和新区规划站#1',
    siteId: 'ZJ_YH_RES_001',
    province: '浙江省丽水市',
    district: '云和县',
    address: '云和新区规划路1号',
    vendor: '待定',
    alarmName: 'N/A (建设类)',
    alarmCount: '0 条',
    deadline: '2025-03-28 12:00 (剩 43h)',
    department: '资源规划部',
    flow: [
      {
        title: '由 资源系统 同步发起',
        time: '2025-03-26 15:10',
        note: '新建站址资源勘察申请，请安排现场勘察。',
        status: 'completed',
      },
      {
        title: '待 王五 处理',
        time: '当前环节',
        status: 'current',
      },
    ],
  },
  {
    id: 'TODO-004',
    creator: 'chinaunicom004',
    title: '[告警] 核心网出口路由器链路震荡',
    priority: '高',
    app: '核心网监控',
    time: '2025-03-26 14:45',
    assignee: '赵六',
    status: '处理中',
    ticketNo: 'WO-20250326-0088',
    netTicketNo: 'NET-CN-11234',
    ticketType: '故障抢修 - 核心网',
    faultType: '链路震荡',
    slaLevel: '一级 (2小时响应)',
    siteName: '核心机房A区',
    siteId: 'CN_HX_A_001',
    province: '浙江省杭州市',
    district: '西湖区',
    address: '杭州核心枢纽楼3层',
    vendor: '华为',
    alarmName: 'Link Flapping',
    alarmCount: '8 条相关告警',
    deadline: '2025-03-26 20:00 (剩 5h)',
    department: '核心网维护组',
    flow: [
      {
        title: '由 核心网监控 发起派单',
        time: '2025-03-26 14:45',
        note: '检测到出口路由器链路反复 UP/DOWN。',
        status: 'completed',
      },
      {
        title: '待 赵六 处理',
        time: '当前环节',
        status: 'current',
      },
    ],
  },
  {
    id: 'TODO-005',
    creator: 'chinaunicom005',
    title: '[客户投诉] 陆家嘴区域5G信号频繁掉线',
    priority: '中',
    app: '客户中心',
    time: '2025-03-26 14:12',
    assignee: '孙七',
    status: '处理中',
    ticketNo: 'WO-20250326-0091',
    netTicketNo: 'NET-KF-55601',
    ticketType: '客户投诉 - 无线质量',
    faultType: '5G信号频繁掉线',
    slaLevel: '二级 (8小时响应)',
    siteName: '中央商务区5G微站',
    siteId: 'SH_LZ_5G_012',
    province: '上海市',
    district: '浦东新区',
    address: '环城商务中心大厦楼顶',
    vendor: '中兴',
    alarmName: 'RRC Setup Failure',
    alarmCount: '3 条相关告警',
    deadline: '2025-03-27 08:00 (剩 17h)',
    department: '客户服务中心',
    flow: [
      {
        title: '由 客户中心 派单',
        time: '2025-03-26 14:12',
        note: 'VIP 客户投诉商务区 5G 频繁掉线。',
        status: 'completed',
      },
      {
        title: '待 孙七 处理',
        time: '当前环节',
        status: 'current',
      },
    ],
  },
  {
    id: 'TODO-006',
    creator: 'chinaunicom006',
    title: '[定期巡检] 虹桥火车站机房电力检查',
    priority: '低',
    app: '动环监控系统',
    time: '2025-03-26 13:30',
    assignee: '周八',
    status: '处理中',
    ticketNo: 'WO-20250326-0095',
    netTicketNo: 'NET-DH-6602',
    ticketType: '定期巡检 - 电力',
    faultType: '机房电力例行检查',
    slaLevel: '三级 (24小时响应)',
    siteName: '虹桥火车站通信机房',
    siteId: 'SH_HQ_RM_001',
    province: '上海市',
    district: '闵行区',
    address: '虹桥火车站东侧通信机房',
    vendor: '施耐德',
    alarmName: 'N/A (巡检类)',
    alarmCount: '0 条',
    deadline: '2025-03-28 18:00 (剩 49h)',
    department: '动环维护中心',
    flow: [
      {
        title: '由 巡检计划 自动生成',
        time: '2025-03-26 13:30',
        note: '季度例行电力巡检任务。',
        status: 'completed',
      },
      {
        title: '待 周八 处理',
        time: '当前环节',
        status: 'current',
      },
    ],
  },
  {
    id: 'TODO-007',
    creator: 'chinaunicom007',
    title: '[建设任务] 丽水云和新区5G基站扩容',
    priority: '低',
    app: '建设部门',
    time: '2025-03-26 12:55',
    assignee: '吴九',
    status: '处理中',
    ticketNo: 'WO-20250326-0102',
    netTicketNo: 'NET-JS-YH-8801',
    ticketType: '建设扩容 - 5G宏站',
    faultType: '5G基站新建/扩容',
    slaLevel: '三级 (24小时响应)',
    siteName: '丽水云和新区规划站#3',
    siteId: 'ZJ_YH_5G_P03',
    province: '浙江省丽水市',
    district: '云和县',
    address: '云和新区规划路与新城大道交叉口',
    vendor: '华为 (Huawei)',
    alarmName: 'N/A (建设类)',
    alarmCount: '0 条',
    deadline: '2025-03-30 12:00 (剩 96h)',
    department: '工程建设部',
    flow: [
      {
        title: '由 建设部门 发起',
        time: '2025-03-26 12:55',
        note: '5G 宏站扩容建设任务下发。',
        status: 'completed',
      },
      {
        title: '待 吴九 处理',
        time: '当前环节',
        status: 'current',
      },
    ],
  },
  {
    id: 'TODO-008',
    creator: 'chinaunicom008',
    title: '[紧急] 某核心机房空调故障',
    priority: '高',
    app: '动环监控系统',
    time: '2025-03-26 11:40',
    assignee: '郑十',
    status: '处理中',
    ticketNo: 'WO-20250326-0108',
    netTicketNo: 'NET-DH-7710',
    ticketType: '动环抢修 - 空调',
    faultType: '机房空调故障 / 温度升高',
    slaLevel: '一级 (2小时响应)',
    siteName: '某核心机房',
    siteId: 'CN_AC_B_002',
    province: '浙江省杭州市',
    district: '滨江区',
    address: '核心机房B栋2层空调机房',
    vendor: '约克 (York)',
    alarmName: 'High Temperature',
    alarmCount: '6 条相关告警',
    deadline: '2025-03-26 15:00 (剩 3h)',
    department: '动环维护中心',
    flow: [
      {
        title: '由 动环监控系统 自动派单',
        time: '2025-03-26 11:40',
        note: '机房温度持续升高，空调压缩机告警。',
        status: 'completed',
      },
      {
        title: '待 郑十 处理',
        time: '当前环节',
        status: 'current',
      },
    ],
  },
  {
    id: 'TODO-009',
    creator: 'chinaunicom009',
    title: '[告警] 城区汇聚层光缆中断',
    priority: '高',
    app: '传输网络部',
    time: '2025-03-26 10:32',
    assignee: '钱一',
    status: '处理中',
    ticketNo: 'WO-20250326-0115',
    netTicketNo: 'NET-TR-3344',
    ticketType: '故障抢修 - 传输',
    faultType: '光缆中断',
    slaLevel: '一级 (4小时响应)',
    siteName: '城区汇聚机房',
    siteId: 'TR_CITY_001',
    province: '浙江省丽水市',
    district: '莲都区',
    address: '城区汇聚机房光交箱A03',
    vendor: '烽火',
    alarmName: 'LOS',
    alarmCount: '15 条相关告警',
    deadline: '2025-03-26 18:00 (剩 7h)',
    department: '传输网络部',
    flow: [
      {
        title: '由 传输网络部 发起派单',
        time: '2025-03-26 10:32',
        note: '城区汇聚层主干光缆中断，影响多个接入站。',
        status: 'completed',
      },
      {
        title: '待 钱一 处理',
        time: '当前环节',
        status: 'current',
      },
    ],
  },
  {
    id: 'TODO-010',
    creator: 'chinaunicom010',
    title: '[投诉] 宽带装机超时工单催办',
    priority: '中',
    app: '客户中心',
    time: '2025-03-26 09:58',
    assignee: '孙七',
    status: '处理中',
    ticketNo: 'WO-20250326-0120',
    netTicketNo: 'NET-KF-6702',
    ticketType: '客户投诉 - 装维',
    faultType: '宽带装机超时',
    slaLevel: '二级 (8小时响应)',
    siteName: '城东营业厅装维站',
    siteId: 'SV_EAST_003',
    province: '浙江省丽水市',
    district: '莲都区',
    address: '城东街道营业厅',
    vendor: 'N/A',
    alarmName: 'N/A (投诉类)',
    alarmCount: '0 条',
    deadline: '2025-03-27 09:00 (剩 23h)',
    department: '客户服务中心',
    flow: [
      {
        title: '由 客户中心 催办派单',
        time: '2025-03-26 09:58',
        note: '装机超时超 48 小时，客户二次投诉。',
        status: 'completed',
      },
      {
        title: '待 孙七 处理',
        time: '当前环节',
        status: 'current',
      },
    ],
  },
  {
    id: 'TODO-011',
    creator: 'chinaunicom011',
    title: '[巡检] 季度蓄电池放电测试',
    priority: '低',
    app: '动环监控系统',
    time: '2025-03-25 17:20',
    assignee: '周八',
    status: '处理中',
    ticketNo: 'WO-20250325-0201',
    netTicketNo: 'NET-DH-8811',
    ticketType: '定期巡检 - 蓄电池',
    faultType: '蓄电池放电测试',
    slaLevel: '三级 (24小时响应)',
    siteName: '丽水中心枢纽',
    siteId: 'ZJ_LS_HUB_001',
    province: '浙江省丽水市',
    district: '莲都区',
    address: '丽水中心枢纽大楼B2蓄电池室',
    vendor: '南都电源',
    alarmName: 'N/A (巡检类)',
    alarmCount: '0 条',
    deadline: '2025-03-28 17:00 (剩 72h)',
    department: '动环维护中心',
    flow: [
      {
        title: '由 巡检计划 自动生成',
        time: '2025-03-25 17:20',
        note: '季度蓄电池核容放电测试。',
        status: 'completed',
      },
      {
        title: '待 周八 处理',
        time: '当前环节',
        status: 'current',
      },
    ],
  },
  {
    id: 'TODO-012',
    creator: 'chinaunicom012',
    title: '[优化] 高铁沿线切换参数调整',
    priority: '中',
    app: '无线优化中心',
    time: '2025-03-25 15:44',
    assignee: '李四',
    status: '处理中',
    ticketNo: 'WO-20250325-0210',
    netTicketNo: 'NET-WX-9901',
    ticketType: '网络优化 - 高铁',
    faultType: '切换参数调整',
    slaLevel: '二级 (8小时响应)',
    siteName: '丽水南站G502',
    siteId: 'ZJ_LS_BS_0982',
    province: '浙江省丽水市',
    district: '莲都区',
    address: '丽水火车站站前路2号',
    vendor: '华为 (Huawei)',
    alarmName: 'N/A (优化类)',
    alarmCount: '0 条',
    deadline: '2025-03-27 16:00 (剩 48h)',
    department: '无线优化中心',
    flow: [
      {
        title: '由 无线优化中心 发起',
        time: '2025-03-25 15:44',
        note: '高铁沿线切换成功率偏低，需调整邻区参数。',
        status: 'completed',
      },
      {
        title: '待 李四 处理',
        time: '当前环节',
        status: 'current',
      },
    ],
  },
]

/* ===================== 批量演示数据（大数据量分页验证） ===================== */

/**
 * 待办 mock 数据总量：默认 10000 条，用于验证分页在大数据量下的展示
 * （底部「共 10000 条」、页码跳转、每页条数切换、全选/筛选仍然流畅）。
 * 手写的 12 条高保真工单固定排在最前（第 1 页观感不变），其余为程序生成。
 * 环境变量 VITE_MOCK_TODO_TOTAL 可覆盖；设为 12 即还原精简演示数据。
 */
const MOCK_TODO_TOTAL = (() => {
  const raw = Number(import.meta.env.VITE_MOCK_TODO_TOTAL)
  return Number.isFinite(raw) && raw >= 12 ? Math.floor(raw) : 10000
})()

/**
 * 确定性伪随机：同一 index 每次取值一致（不依赖 Math.random），
 * 保证刷新后数据不跳变 —— 选中态、详情、地图落点、SLA 文案都稳定。
 */
function seeded(index: number, salt = 0): number {
  const x = Math.sin((index + 1) * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}

/** 按工单号稳定推导 SLA 剩余小时数（-6 ~ 96），供批量工单展示剩余时长，避免显示 "--" */
function bulkSlaHours(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) % 9973
  return (hash % 103) - 6
}

const BULK_TITLE_TEMPLATES = [
  '【日常巡检】{site} 基站设备例行巡检',
  '【故障抢修】{site} {fault}',
  '【高铁督办工单】[衍生关联]{fault}',
  '【家客装维】{site} 宽带接入障碍处理',
  '【投诉工单】{site} 用户投诉网络质量差',
  '【扩容需求】{site} 小区话务量超载扩容评估',
  '【动环监控】{site} 电源设备告警核查',
  '【传输代维】{site} 光缆中断抢修',
  '【无线网优】{site} 弱覆盖优化整改',
  '【核心网】{site} 网元链路异常排查',
]

const BULK_SITES = [
  '丽水南站G502', '青田万阜G318', '缙云五云G227', '遂昌妙高G115', '松阳西屏G401',
  '云和白龙G602', '庆元松源G733', '景宁鹤溪G889', '龙泉剑池G156', '缙云壶镇G330',
  '莲都白云小区', '青田温溪G208', '遂昌石练G551', '松阳古市G452', '云和浮云G678',
  '庆元屏都G701', '景宁沙湾G812', '龙泉八都G189', '莲都紫金G122', '青田船寮G277',
]

const BULK_FAULTS = [
  'LTE小区退出服务', '基站断电告警', '传输链路中断', '天馈系统驻波比异常',
  '动环湿度过高告警', '光模块故障', 'GPS失锁', '开关电源模块损坏',
  '小区掉话率突增', '核心网元脱管',
]

const BULK_ALARMS = [
  'Cell Unavailable', 'VSWR Threshold Critical', 'Power System Failure', 'Temperature High',
  'Transmission Link Down', 'GPS Unlock', 'Battery Low Voltage', 'Fan Fault',
]

const BULK_APPS = [
  '网络运营监控室', '动环监控系统', '资源系统同步', '客户中心',
  '建设部门', '传输网络部', '无线优化中心', '投诉处理中心',
]

const BULK_VENDORS = ['华为 (Huawei)', '中兴 (ZTE)', '爱立信 (Ericsson)', '诺基亚 (Nokia)']

const BULK_DEPARTMENTS = [
  '网络运营中心 - 丽水分部', '网络优化中心', '传输维护中心', '动力环境维护中心', '客户服务中心',
]

const BULK_ASSIGNEES = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十']

const BULK_SLA_LEVELS = ['一级 (4小时响应)', '二级 (8小时响应)', '三级 (24小时响应)']

const BULK_PRIORITIES: TodoTicket['priority'][] = ['高', '中', '低']

/** 生成第 seq 条批量工单（index 用于确定性取值），字段与手写工单保持同一 schema */
function buildBulkTicket(seq: number, index: number): TodoTicket {
  const pick = <T>(pool: T[], salt: number): T => pool[Math.floor(seeded(index, salt) * pool.length)]
  const id = `TODO-${String(seq).padStart(4, '0')}`
  const site = pick(BULK_SITES, 1)
  const fault = pick(BULK_FAULTS, 2)
  const alarm = pick(BULK_ALARMS, 3)
  /** 从最后一条手写工单（2025-03-25 15:44）起每条回退 7 分钟，时间线严格递减 */
  const t = BULK_TIME_BASE.subtract(index * 7, 'minute')
  const time = t.format('YYYY-MM-DD HH:mm')

  return {
    id,
    creator: `chinaunicom${String(seq).padStart(3, '0')}`,
    title: pick(BULK_TITLE_TEMPLATES, 4).replace('{site}', site).replace('{fault}', fault),
    priority: pick(BULK_PRIORITIES, 5),
    app: pick(BULK_APPS, 6),
    time,
    assignee: pick(BULK_ASSIGNEES, 7),
    status: '处理中',
    ticketNo: `WO-${t.format('YYYYMMDD')}-${String(200 + seq).padStart(4, '0')}`,
    netTicketNo: `NET-LS-${String(900000 + seq)}`,
    ticketType: fault.includes('巡检') ? '日常巡检' : '故障抢修',
    faultType: fault,
    slaLevel: pick(BULK_SLA_LEVELS, 8),
    siteName: site,
    siteId: `ZJ_LS_BS_${String(1000 + seq)}`,
    province: '浙江省丽水市',
    district: pick(['莲都区', '青田县', '缙云县', '遂昌县', '松阳县', '云和县', '庆元县', '景宁县', '龙泉市'], 9),
    address: `${site} 基站机房`,
    vendor: pick(BULK_VENDORS, 10),
    alarmName: alarm,
    alarmCount: `${1 + Math.floor(seeded(index, 11) * 20)} 条相关告警`,
    department: pick(BULK_DEPARTMENTS, 12),
    description: `监控系统于 ${time} 上报「${alarm}」告警，现场核查确认为 ${fault}。初步判断为传输或电源侧异常，需现场更换部件后复测验证。`,
    impactUsers: `${100 + Math.floor(seeded(index, 13) * 3000)} 户`,
    impactCells: `${1 + Math.floor(seeded(index, 14) * 6)} 个`,
    businessType: pick(['公众移动通信', '高铁专网通信', '政企专线', '家庭宽带'], 15),
  }
}

/** 批量工单基准时间 = 最后一条手写工单的时间，保证时间线连续 */
const BULK_TIME_BASE = dayjs('2025-03-25 15:44')

/** 把 mockTickets 补齐到 MOCK_TODO_TOTAL 条（手写 12 条在前，批量工单在后） */
function fillBulkTickets(): void {
  const more = MOCK_TODO_TOTAL - mockTickets.length
  if (more <= 0) return
  for (let i = 0; i < more; i += 1) {
    mockTickets.push(buildBulkTicket(mockTickets.length + 1, i))
  }
}

fillBulkTickets()

/**
 * 模拟获取待办工单列表接口
 */
export async function fetchTodoList(params?: FetchTodoListParams): Promise<TodoListResult> {
  await new Promise((resolve) => setTimeout(resolve, 60))

  let filtered = [...mockTickets]

  if (params?.priority) {
    const target = PRIORITY_VALUE_TO_LABEL[params.priority] ?? params.priority
    filtered = filtered.filter((item) => item.priority === target)
  }

  if (params?.source) {
    const target = SOURCE_VALUE_TO_LABEL[params.source] ?? params.source
    filtered = filtered.filter((item) => item.app === target)
  }

  if (params?.date) {
    filtered = filtered.filter((item) => item.time.slice(0, 10) === params.date)
  }

  if (params?.keyword) {
    const kw = params.keyword.trim().toLowerCase()
    filtered = filtered.filter(
      (item) => item.title.toLowerCase().includes(kw) || item.app.toLowerCase().includes(kw),
    )
  }

  if (params?.smartSort) {
    const weight: Record<string, number> = { 高: 3, 中: 2, 低: 1 }
    filtered.sort((a, b) => (weight[b.priority] || 0) - (weight[a.priority] || 0))
  }

  const total = filtered.length
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  const list = filtered.slice((page - 1) * pageSize, page * pageSize).map(decorate)
  const hasMore = page * pageSize < total

  return { list, total, hasMore }
}

/**
 * 站点经纬度对照表(百度 BD09)—— 模拟后端按站点维度存储的坐标,
 * 列表接口返回时统一附上,地图模式与列表模式共用同一份数据。
 */
const MOCK_TICKET_COORDS: Record<string, { lng: number; lat: number }> = {
  'TODO-001': { lng: 119.9325, lat: 28.441 },
  'TODO-002': { lng: 119.918, lat: 28.462 },
  'TODO-003': { lng: 119.885, lat: 28.451 },
  'TODO-004': { lng: 119.929, lat: 28.471 },
  'TODO-005': { lng: 119.905, lat: 28.455 },
  'TODO-006': { lng: 119.941, lat: 28.435 },
  'TODO-007': { lng: 119.892, lat: 28.465 },
  'TODO-008': { lng: 119.921, lat: 28.468 },
  'TODO-009': { lng: 119.915, lat: 28.448 },
  'TODO-010': { lng: 119.92, lat: 28.459 },
  'TODO-011': { lng: 119.908, lat: 28.431 },
  'TODO-012': { lng: 119.938, lat: 28.446 },
}

/** 为工单附加经纬度(真实接口由后端返回,这里模拟联表) */
function withCoords(ticket: TodoTicket): TodoTicket {
  const coords = MOCK_TICKET_COORDS[ticket.id]
  if (coords) return { ...ticket, ...coords }
  return { ...ticket }
}

/**
 * SLA 剩余时长 —— 真实接口按「现在 vs 处理时限」实时计算,这里同样相对当前时间推算,
 * 保证演示数据的「剩余处理时长」始终合理(不会因为写死的时限随日期流逝变成「已超时 6580h」)。
 * 基准取 deadline 里静态文案的「剩 Nh」相对值,负值即已超时。
 */
const MOCK_SLA_REMAIN_HOURS: Record<string, number> = {
  'TODO-001': 18,
  'TODO-002': 13,
  'TODO-003': 43,
  'TODO-004': 5,
  'TODO-005': 17,
  'TODO-006': 49,
  'TODO-007': 96,
  'TODO-008': 3,
  'TODO-009': -2,
  'TODO-010': 23,
  'TODO-011': 72,
  'TODO-012': 48,
}

/** 剩余小时数 → 展示文案(与真实接口下发格式一致:「18h」「1天 6h」「已超时 Xh」) */
function formatRemaining(hours: number): string {
  if (hours < 0) return `已超时 ${Math.abs(hours)}h`
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}天 ${hours % 24}h`
}

/** 为工单附加 SLA 剩余时长与处理时限(模拟后端实时计算) */
function withSla(ticket: TodoTicket): TodoTicket {
  /** 手写 12 条有固定基准值;批量工单按 id 稳定推导,避免卡片显示「剩余处理时长: --」 */
  const remain = MOCK_SLA_REMAIN_HOURS[ticket.id] ?? bulkSlaHours(ticket.id)
  const due = dayjs().add(remain, 'hour').format('YYYY-MM-DD HH:mm')
  return {
    ...ticket,
    deadline: `${due} (${remain >= 0 ? `剩 ${remain}h` : `已超时 ${Math.abs(remain)}h`})`,
    remainingTime: formatRemaining(remain),
    remainingHours: remain,
  }
}

/** 列表 / 详情统一的字段装饰(经纬度 + SLA) */
function decorate(ticket: TodoTicket): TodoTicket {
  return withSla(withCoords(ticket))
}

/** 转派高频快捷回复 mock */
const mockQuickReplies: TransferQuickReply[] = [
  { id: 'qr-1', content: '情况已核实，正在处理中' },
  { id: 'qr-2', content: '故障已排除，请复测' },
  { id: 'qr-3', content: '需现场排查，预计 2 小时内反馈' },
  { id: 'qr-4', content: '已联系厂家支持，等待回复' },
]

/** 转派对象 mock */
const mockAssignees: TransferAssignee[] = [
  { id: 'u-1', name: '张三', dept: '网络运营中心 - 丽水分部', phone: '13800001111' },
  { id: 'u-2', name: '李四', dept: '动环维护中心', phone: '13800002222' },
  { id: 'u-3', name: '王五', dept: '资源规划部', phone: '13800003333' },
  { id: 'u-4', name: '赵六', dept: '核心网维护组', phone: '13800004444' },
  { id: 'u-5', name: '孙七', dept: '客户服务中心', phone: '13800005555' },
  { id: 'u-6', name: '周八', dept: '动环维护中心', phone: '13800006666' },
  { id: 'u-7', name: '吴九', dept: '工程建设部', phone: '13800007777' },
  { id: 'u-8', name: '郑十', dept: '传输网络部', phone: '13800008888' },
]

export async function fetchTransferQuickReplies(): Promise<TransferQuickReply[]> {
  await new Promise((r) => setTimeout(r, 40))
  return [...mockQuickReplies]
}

export async function fetchTransferAssignees(keyword?: string): Promise<TransferAssignee[]> {
  await new Promise((r) => setTimeout(r, 40))
  const kw = keyword?.trim().toLowerCase()
  if (!kw) return [...mockAssignees]
  return mockAssignees.filter(
    (a) =>
      a.name.toLowerCase().includes(kw) ||
      (a.dept && a.dept.toLowerCase().includes(kw)) ||
      (a.phone && a.phone.includes(kw)),
  )
}


/* —— 工单订阅缓冲区 —— */

export type SubscriptionCategory = 'alarm' | 'site' | 'cell' | 'history'

export interface SubscriptionBufferItem {
  id: string
  ticketId: string
  category: SubscriptionCategory
  tag: string
  title: string
  meta: string
  timeLabel: string
  createdAt: number
}

/** 内存态订阅缓冲（模拟服务端按工单维度存储） */
const subscriptionStore: SubscriptionBufferItem[] = []

export interface SubscribeBufferParams {
  ticketId: string
  category: SubscriptionCategory
  tag: string
  title: string
  meta?: string
}

/** 智能工具箱「订阅」：写入当前工单订阅缓冲区 */
export async function subscribeBufferItem(
  params: SubscribeBufferParams,
): Promise<SubscriptionBufferItem> {
  await new Promise((r) => setTimeout(r, 120))
  const item: SubscriptionBufferItem = {
    id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ticketId: params.ticketId,
    category: params.category,
    tag: params.tag,
    title: params.title,
    meta: params.meta || '',
    timeLabel: '刚刚',
    createdAt: Date.now(),
  }
  subscriptionStore.unshift(item)
  return item
}

export interface FetchSubscriptionBufferParams {
  ticketId: string
  /** all | alarm | cell | site | history */
  tab?: string
}

/** 工单订阅缓冲区列表查询 */
export async function fetchSubscriptionBuffer(
  params: FetchSubscriptionBufferParams,
): Promise<SubscriptionBufferItem[]> {
  await new Promise((r) => setTimeout(r, 150))
  let list = subscriptionStore.filter((i) => i.ticketId === params.ticketId)
  const tab = params.tab || 'all'
  if (tab === 'alarm') list = list.filter((i) => i.category === 'alarm' || i.category === 'history')
  else if (tab === 'cell') list = list.filter((i) => i.category === 'cell')
  else if (tab === 'site') list = list.filter((i) => i.category === 'site')
  return list.map((i) => ({ ...i }))
}

/** 删除订阅缓冲项 */
export async function removeSubscriptionBufferItem(
  id: string,
): Promise<void> {
  await new Promise((r) => setTimeout(r, 80))
  const idx = subscriptionStore.findIndex((i) => i.id === id)
  if (idx >= 0) subscriptionStore.splice(idx, 1)
}

/** 演示：若某工单尚无数据，可写入一批默认项（仅首次） */
export async function ensureDemoSubscriptionBuffer(ticketId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 40))
  if (subscriptionStore.some((i) => i.ticketId === ticketId)) return
  const demo: Omit<SubscriptionBufferItem, 'id' | 'createdAt'>[] = [
    {
      ticketId,
      category: 'alarm',
      tag: '活动告警',
      title: '星钟失步告警 - 机柜0-机框1-槽位2',
      meta: '发生: 2025-03-26 14:22 | 持续: 2h15min | 级别: 紧急',
      timeLabel: '刚刚',
    },
    {
      ticketId,
      category: 'site',
      tag: '基站状态',
      title: '兴华路-4（正常运行）',
      meta: '下行:842Mbps 上行:124Mbps | 丢包:0.01% 时延:12ms | CPU:25% 内存:40%',
      timeLabel: '刚刚',
    },
    {
      ticketId,
      category: 'cell',
      tag: '小区状态',
      title: 'LSFL831011北京南站-1（正常）',
      meta: '网络: 4G | 信号: -72 dBm | 运行正常',
      timeLabel: '刚刚',
    },
  ]
  demo.forEach((d, i) => {
    subscriptionStore.push({
      ...d,
      id: `sub-demo-${ticketId}-${i}`,
      createdAt: Date.now() - i * 1000,
    })
  })
}

/* —— 待办新增 / 详情(与列表共用 mockTickets 存储,创建后列表 / 地图模式立即可见) —— */

/** 获取待办工单详情 */
export async function fetchTodoDetail(id: string): Promise<TodoTicket> {
  await new Promise((resolve) => setTimeout(resolve, 80))
  const ticket = mockTickets.find((item) => item.id === id)
  if (!ticket) {
    throw new Error(`工单不存在: ${id}`)
  }
  return decorate({ ...ticket })
}

/* —— 工单转派 / 批量审批(与列表共享 mockTickets 存储,流转后列表/地图实时同步) —— */

/**
 * 转派工单:更换处理人、原当前环节置为已完成并追加转派流转记录,
 * 返回流转信息更新后的完整工单。
 */
export async function transferTodo(params: TransferTodoParams): Promise<TodoTicket> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const ticket = mockTickets.find((item) => item.id === params.ticketId)
  if (!ticket) {
    throw new Error(`工单不存在: ${params.ticketId}`)
  }
  const person = mockAssignees.find((a) => a.id === params.assigneeId)
  if (!person) {
    throw new Error('转派对象不存在')
  }

  const now = dayjs().format('YYYY-MM-DD HH:mm')
  const flow = (ticket.flow ?? []).map((node) =>
    node.status === 'current' ? { ...node, status: 'completed' as const } : node,
  )
  flow.push(
    {
      title: `由 张工 转派给 ${person.name}`,
      time: now,
      note: params.remark || undefined,
      status: 'completed',
    },
    { title: `待 ${person.name} 处理`, time: '当前环节', status: 'current' },
  )
  ticket.assignee = person.name
  ticket.department = person.dept || ticket.department
  ticket.flow = flow
  return decorate({ ...ticket })
}

/**
 * 批量审批(通过/驳回):所选工单按批次完成流转,直接移出待办列表,
 * 返回实际处理数量。
 */
export async function batchProcessTodo(
  params: BatchProcessTodoParams,
): Promise<{ processed: number }> {
  await new Promise((resolve) => setTimeout(resolve, 250))
  const idSet = new Set(params.ticketIds)
  const before = mockTickets.length
  for (let i = mockTickets.length - 1; i >= 0; i -= 1) {
    if (idSet.has(mockTickets[i].id)) {
      mockTickets.splice(i, 1)
    }
  }
  return { processed: before - mockTickets.length }
}
