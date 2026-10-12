import { Menu } from 'antd'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { MaterialIcon } from '../../../components/MaterialIcon'
import { useMenuBadgeStore } from '../../../store/menuBadgeStore'

import { menuItems } from '../menuConfig'

import styles from './AppSidebar.module.scss'

/**
 * 左侧菜单 —— 默认只展示图标,鼠标移入展开完整菜单(覆盖式,不挤压内容区),移出收起。
 * 菜单项由 menuConfig 统一声明,此处遍历渲染;
 * 角标数量优先取启动时接口结果,接口没有的菜单用配置里的 num 兜底。
 */
export function AppSidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [expanded, setExpanded] = useState(false)
  const counts = useMenuBadgeStore((state) => state.counts)

  const menuItemsRendered = menuItems.map((item) => {
    const count = counts[item.key] ?? item.num ?? 0

    return {
      key: item.key,
      label: item.label,
      // 角标按原型实现:正圆小红点白描边骑图标右上角;99+ 圆内放不下退化为胶囊
      icon: (
        <span className={styles.menuIcon}>
          {item.icon}
          {count > 0 && (
            <span
              className={
                count > 99 ? `${styles.menuBadge} ${styles.menuBadgeWide}` : styles.menuBadge
              }
            >
              {count > 99 ? '99+' : count}
            </span>
          )}
        </span>
      ),
    }
  })

  return (
    // 外层恒定 64px 占位,内层导航绝对定位,展开时宽度动画到 208px 浮在内容上方
    <aside className={styles.rail}>
      <nav
        className={expanded ? `${styles.nav} ${styles.navExpanded}` : styles.nav}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {/* 系统 logo 区:收起只露图标,展开显示标题 */}
        <div className={styles.brand}>
          <MaterialIcon name="router" className={styles.brandIcon} />
          <span className={styles.brandName}>统一待办</span>
        </div>
        <Menu
          className={styles.menu}
          mode="inline"
          inlineCollapsed={!expanded}
          selectedKeys={[pathname]}
          onClick={({ key }) => navigate(key)}
          items={menuItemsRendered}
        />
      </nav>
    </aside>
  )
}
