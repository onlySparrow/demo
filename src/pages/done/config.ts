export interface SelectOption {
  value: string
  label: string
}

/** 已办 - 处理结果下拉字典数据 */
export const DONE_RESULT_OPTIONS: SelectOption[] = [
  { value: 'completed', label: '已完成' },
  { value: 'archived', label: '已归档' },
  { value: 'transferred', label: '已转派' },
  { value: 'rejected', label: '已驳回' },
]

/** 已办 - 来源系统下拉字典数据 */
export const DONE_SOURCE_OPTIONS: SelectOption[] = [
  { value: 'network_ops', label: '网络运营监控室' },
  { value: 'power_monitor', label: '动环监控系统' },
  { value: 'core_net', label: '核心网监控' },
  { value: 'customer_center', label: '客户中心' },
  { value: 'construction', label: '建设部门' },
]

export function getDoneResultLabel(val?: string): string | undefined {
  if (!val) return undefined
  const item = DONE_RESULT_OPTIONS.find((opt) => opt.value === val || opt.label === val)
  return item ? item.label : val
}

export function getDoneSourceLabel(val?: string): string | undefined {
  if (!val) return undefined
  const item = DONE_SOURCE_OPTIONS.find((opt) => opt.value === val || opt.label === val)
  return item ? item.label : val
}
