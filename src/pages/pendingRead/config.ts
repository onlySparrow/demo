export interface SelectOption {
  value: string
  label: string
}

/** 待阅通知 - 分类下拉字典数据 */
export const UNREAD_CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'special_work', label: '专项工作' },
  { value: 'tech_spec', label: '技术规范' },
  { value: 'meeting_notice', label: '会议通知' },
  { value: 'security_alert', label: '安全预警' },
]

/** 待阅通知 - 紧急度下拉字典数据 */
export const UNREAD_URGENCY_OPTIONS: SelectOption[] = [
  { value: 'urgent', label: '紧急' },
  { value: 'important', label: '重要' },
  { value: 'normal', label: '普通' },
]

export function getUnreadCategoryLabel(val?: string): string | undefined {
  if (!val) return undefined
  const item = UNREAD_CATEGORY_OPTIONS.find((opt) => opt.value === val || opt.label === val)
  return item ? item.label : val
}

export function getUnreadUrgencyLabel(val?: string): string | undefined {
  if (!val) return undefined
  const item = UNREAD_URGENCY_OPTIONS.find((opt) => opt.value === val || opt.label === val)
  return item ? item.label : val
}
