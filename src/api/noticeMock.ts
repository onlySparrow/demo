import type { FetchNoticeParams, NoticeItem, NoticeResult } from './notice'

export type { NoticeItem, FetchNoticeParams, NoticeResult }

export let mockUnreadNotices: NoticeItem[] = [
  {
    id: 'UNREAD-001',
    title: '关于开展2025年Q2网络安全隐患排查专项行动的通知',
    department: '网络与信息安全管理部',
    publishTime: '2025-03-26 09:00',
    category: '专项工作',
    isRead: false,
    urgency: '重要',
    summary: '根据集团公司统一部署，定于4月1日起开展为期一个月的网络安全隐患排查专项行动，覆盖核心网与数据中心。',
    attachments: [
      { name: 'Q2专项行动方案.pdf', type: 'pdf', size: '2.3 MB', icon: 'picture_as_pdf' },
      { name: '排查检查表.xlsx', type: 'excel', size: '856 KB', icon: 'table_view' },
    ],
  },
  {
    id: 'UNREAD-002',
    title: '关于核心网升级割接窗口期调整的通告',
    department: '核心网运营中心',
    publishTime: '2025-03-26 08:30',
    category: '技术规范',
    isRead: false,
    urgency: '紧急',
    summary: '本周五凌晨 02:00~05:00 进行核心路由倒换升级，请各分部值班专员做好流量监控与应急响应。',
    attachments: [{ name: '割接方案及回退预案.docx', type: 'doc', size: '1.1 MB', icon: 'description' }],
  },
  {
    id: 'UNREAD-003',
    title: '关于组织参加2025年春季应急通信演练的通知',
    department: '应急保障协同部',
    publishTime: '2025-03-25 16:40',
    category: '会议通知',
    isRead: false,
    urgency: '普通',
    summary: '拟于下周二下午在杭州基地开展防汛防台应急通信联合保障演练，各参演人员请准时就位。',
  },
  {
    id: 'UNREAD-004',
    title: '关于印发《5G基站节能减排操作指导手册（2025版）》的通知',
    department: '无线网络规划部',
    publishTime: '2025-03-25 14:10',
    category: '技术规范',
    isRead: false,
    urgency: '普通',
    summary: '为进一步落实绿色基站降耗战略，现发布最新节能策略配置模板，各基站机房自4月1日起试行。',
    attachments: [{ name: '节能减排指导手册.pdf', type: 'pdf', size: '4.8 MB', icon: 'picture_as_pdf' }],
  },
  {
    id: 'UNREAD-005',
    title: '重要告警：华东骨干环网光缆施工外力破坏风险预警',
    department: '传输网络部',
    publishTime: '2025-03-25 10:20',
    category: '安全预警',
    isRead: false,
    urgency: '紧急',
    summary: '沿线市政地铁三期开工，多处穿缆段处于动土区域，请传输巡检组启动特巡与现场监护。',
  },
]

export let mockReadNotices: NoticeItem[] = [
  {
    id: 'READ-001',
    title: '关于加强春季通信线路防外力破坏工作的通知',
    department: '传输网络部',
    publishTime: '2025-03-20 10:30',
    readTime: '2025-03-21 14:22',
    category: '季节性通知',
    urgency: '重要',
    isRead: true,
    summary: '春季施工旺季来临，各地市须加强光缆线路巡检频次，落实"一日三巡"制度并强化现场警示标牌。',
    attachments: [{ name: '专项行动方案.pdf', type: 'pdf', size: '3.2 MB', icon: 'picture_as_pdf' }],
  },
  {
    id: 'READ-002',
    title: '关于调整一线运维人员夜班补贴标准的通知',
    department: '人力资源部',
    publishTime: '2025-03-18 09:00',
    readTime: '2025-03-18 15:45',
    category: '薪酬福利',
    urgency: '重要',
    isRead: true,
    summary: '自4月1日起夜班补贴由80元/班次调整为120元/班次，法定节假日调整为200元/班次。',
  },
  {
    id: 'READ-003',
    title: '关于2025年度全员安全生产责任书签订的通知',
    department: '安全生产委员会',
    publishTime: '2025-03-15 11:20',
    readTime: '2025-03-16 09:30',
    category: '专项工作',
    urgency: '普通',
    isRead: true,
    summary: '请各团队于本月25日前完成安全责任书电子签署流程，确保责任层层压实。',
  },
]

export async function fetchUnreadNotices(params?: FetchNoticeParams): Promise<NoticeResult> {
  await new Promise((r) => setTimeout(r, 60))
  let filtered = [...mockUnreadNotices]

  if (params?.keyword) {
    const kw = params.keyword.trim().toLowerCase()
    filtered = filtered.filter(
      (n) => n.title.toLowerCase().includes(kw) || n.department.toLowerCase().includes(kw),
    )
  }

  if (params?.category) {
    const categoryMap: Record<string, string> = {
      special_work: '专项工作',
      tech_spec: '技术规范',
      meeting_notice: '会议通知',
      security_alert: '安全预警',
      seasonal_notice: '季节性通知',
      compensation: '薪酬福利',
    }
    const targetCategory = categoryMap[params.category] ?? params.category
    filtered = filtered.filter((n) => n.category === targetCategory)
  }

  if (params?.urgency) {
    const urgencyMap: Record<string, string> = {
      urgent: '紧急',
      important: '重要',
      normal: '普通',
    }
    const targetUrgency = urgencyMap[params.urgency] ?? params.urgency
    filtered = filtered.filter((n) => n.urgency === targetUrgency)
  }

  const total = filtered.length
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  const list = filtered.slice((page - 1) * pageSize, page * pageSize)
  const hasMore = page * pageSize < total

  return { list, total, hasMore }
}

export async function fetchReadNotices(params?: FetchNoticeParams): Promise<NoticeResult> {
  await new Promise((r) => setTimeout(r, 60))
  let filtered = [...mockReadNotices]

  if (params?.keyword) {
    const kw = params.keyword.trim().toLowerCase()
    filtered = filtered.filter(
      (n) => n.title.toLowerCase().includes(kw) || n.department.toLowerCase().includes(kw),
    )
  }

  if (params?.category) {
    const categoryMap: Record<string, string> = {
      special_work: '专项工作',
      tech_spec: '技术规范',
      meeting_notice: '会议通知',
      security_alert: '安全预警',
      seasonal_notice: '季节性通知',
      compensation: '薪酬福利',
    }
    const targetCategory = categoryMap[params.category] ?? params.category
    filtered = filtered.filter((n) => n.category === targetCategory)
  }

  const total = filtered.length
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  const list = filtered.slice((page - 1) * pageSize, page * pageSize)
  const hasMore = page * pageSize < total

  return { list, total, hasMore }
}

export async function markNoticeAsRead(id: string): Promise<{ success: boolean }> {
  await new Promise((r) => setTimeout(r, 100))
  const item = mockUnreadNotices.find((n) => n.id === id)
  if (item) {
    mockUnreadNotices = mockUnreadNotices.filter((n) => n.id !== id)
    mockReadNotices.unshift({
      ...item,
      isRead: true,
      readTime: new Date().toLocaleString('zh-CN', { hour12: false }),
    })
  }
  return { success: true }
}

export async function batchMarkNoticesAsRead(ids: string[]): Promise<{ success: boolean; count: number }> {
  await new Promise((r) => setTimeout(r, 150))
  const items = mockUnreadNotices.filter((n) => ids.includes(n.id))
  mockUnreadNotices = mockUnreadNotices.filter((n) => !ids.includes(n.id))
  items.forEach((item) => {
    mockReadNotices.unshift({
      ...item,
      isRead: true,
      readTime: new Date().toLocaleString('zh-CN', { hour12: false }),
    })
  })
  return { success: true, count: items.length }
}
