import { Segmented } from 'antd'
import { useSearchParams } from 'react-router'

import styles from './HeaderTabs.module.scss'

export interface HeaderTabOption {
  /** tab 标识,切换时写入地址栏 ?tab= */
  key: string
  /** tab 文案 */
  label: string
}

/**
 * 顶栏常用件:tab 切换组(Segmented 胶囊风)。
 * 配合 HeaderSlot 投到顶栏;状态写入地址栏 ?tab=,可分享 / 刷新恢复。
 */
export function HeaderTabs({ options }: { options: HeaderTabOption[] }) {
  const [searchParams, setSearchParams] = useSearchParams()

  const tabParam = searchParams.get('tab')
  const activeTab = options.some((option) => option.key === tabParam) ? tabParam : options[0]?.key

  return (
    <Segmented
      className={styles.tabs}
      value={activeTab}
      options={options.map((option) => ({ label: option.label, value: option.key }))}
      onChange={(value) => {
        const next = new URLSearchParams(searchParams)
        next.set('tab', String(value))
        setSearchParams(next)
      }}
    />
  )
}
