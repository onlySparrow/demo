export interface SelectOption {
  value: string
  label: string
}

/** 个人效能 - 时间维度字典数据 */
export const PERFORMANCE_PERIOD_OPTIONS: SelectOption[] = [
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'quarter', label: '本季度' },
  { value: 'year', label: '年度' },
  { value: 'custom', label: '自定义' },
]
