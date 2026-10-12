import { useSearchParams } from 'react-router'

import { HeaderSlot } from '../../layouts/BasicLayout/HeaderSlot'
import { HeaderTabs } from '../../layouts/BasicLayout/components/HeaderTabs'

import { TodoListMode } from './list-mode'
import { TodoMapMode } from './map-mode'

/**
 * 待办视图 —— 顶栏切换列表 / 地图模式(模式落在地址栏 ?tab=)。
 */
export function TodoPage() {
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('tab') === 'map' ? 'map' : 'list'

  return (
    <>
      {/* 顶栏插槽:列表/地图模式切换(原型 mapToggleBtns) */}
      <HeaderSlot>
        <HeaderTabs
          options={[
            { key: 'list', label: '列表模式' },
            { key: 'map', label: '地图模式' },
          ]}
        />
      </HeaderSlot>
      {mode === 'map' ? <TodoMapMode /> : <TodoListMode />}
    </>
  )
}
