export interface SelectOption {
  value: string
  label: string
}

/** 待接单 - 紧急度下拉字典数据 */
export const PENDING_PRIORITY_OPTIONS: SelectOption[] = [
  { value: 'high', label: '高' },
  { value: 'mid', label: '中' },
  { value: 'low', label: '低' },
]

/** 待接单 - 所属系统下拉字典数据 */
export const PENDING_SYSTEM_OPTIONS: SelectOption[] = [
  { value: 'core_net', label: '核心网监控' },
  { value: 'customer_center', label: '客户中心' },
  { value: 'power_monitor', label: '动环监控系统' },
  { value: 'construction', label: '建设部门' },
]

export function getPendingPriorityLabel(val?: string): string | undefined {
  if (!val) return undefined
  const item = PENDING_PRIORITY_OPTIONS.find((opt) => opt.value === val || opt.label === val)
  return item ? item.label : val
}

export function getPendingSystemLabel(val?: string): string | undefined {
  if (!val) return undefined
  const item = PENDING_SYSTEM_OPTIONS.find((opt) => opt.value === val || opt.label === val)
  return item ? item.label : val
}
