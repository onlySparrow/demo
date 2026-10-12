export interface SelectOption {
  value: string
  label: string
}

/** 由我发起 - 状态下拉字典数据 */
export const INITIATED_STATUS_OPTIONS: SelectOption[] = [
  { value: 'processing', label: '处理中' },
  { value: 'pending', label: '待接单' },
  { value: 'completed', label: '已办结' },
  { value: 'withdrawn', label: '已撤回' },
]

/** 由我发起 - 紧急度下拉字典数据 */
export const INITIATED_URGENCY_OPTIONS: SelectOption[] = [
  { value: 'high', label: '高' },
  { value: 'mid', label: '中' },
  { value: 'low', label: '低' },
]

/** 由我发起 - 目标部门下拉字典数据 */
export const INITIATED_TARGET_DEPT_OPTIONS: SelectOption[] = [
  { value: 'noc_lishui', label: '网络运营中心 - 丽水分部' },
  { value: 'power_team2', label: '动环抢修二队' },
  { value: 'resource_center', label: '资源规划与建设中心' },
  { value: 'transmission_dept', label: '传输网络部' },
]

export function getInitiatedStatusLabel(val?: string): string | undefined {
  if (!val) return undefined
  const item = INITIATED_STATUS_OPTIONS.find((opt) => opt.value === val || opt.label === val)
  return item ? item.label : val
}

export function getInitiatedUrgencyLabel(val?: string): string | undefined {
  if (!val) return undefined
  const item = INITIATED_URGENCY_OPTIONS.find((opt) => opt.value === val || opt.label === val)
  return item ? item.label : val
}

export function getInitiatedTargetDeptLabel(val?: string): string | undefined {
  if (!val) return undefined
  const item = INITIATED_TARGET_DEPT_OPTIONS.find((opt) => opt.value === val || opt.label === val)
  return item ? item.label : val
}
