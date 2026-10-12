export interface SelectOption {
  value: string
  label: string
}

/** 已阅通知 - 分类下拉字典数据 */
export const READ_CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'seasonal_notice', label: '季节性通知' },
  { value: 'compensation', label: '薪酬福利' },
  { value: 'special_work', label: '专项工作' },
]

export function getReadCategoryLabel(val?: string): string | undefined {
  if (!val) return undefined
  const item = READ_CATEGORY_OPTIONS.find((opt) => opt.value === val || opt.label === val)
  return item ? item.label : val
}
