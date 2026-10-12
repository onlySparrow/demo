export interface SelectOption {
  value: string
  label: string
}

/** 待办 - 紧急度下拉字典数据 */
export const TODO_PRIORITY_OPTIONS: SelectOption[] = [
  { value: 'high', label: '高' },
  { value: 'mid', label: '中' },
  { value: 'low', label: '低' },
]

/** 待办 - 来源系统下拉字典数据 */
export const TODO_SOURCE_OPTIONS: SelectOption[] = [
  { value: 'network_ops', label: '网络运营监控室' },
  { value: 'power_monitor', label: '动环监控系统' },
  { value: 'resource_sync', label: '资源系统同步' },
  { value: 'core_net', label: '核心网监控' },
  { value: 'customer_center', label: '客户中心' },
  { value: 'construction', label: '建设部门' },
  { value: 'transmission', label: '传输网络部' },
  { value: 'wireless_opt', label: '无线优化中心' },
]

/**
 * 辅助映射：将 value 或 label 转换为对应 label 文案，便于与列表数据匹配
 */
export function getTodoPriorityLabel(val?: string): string | undefined {
  if (!val) return undefined
  const item = TODO_PRIORITY_OPTIONS.find((opt) => opt.value === val || opt.label === val)
  return item ? item.label : val
}

export function getTodoSourceLabel(val?: string): string | undefined {
  if (!val) return undefined
  const item = TODO_SOURCE_OPTIONS.find((opt) => opt.value === val || opt.label === val)
  return item ? item.label : val
}
