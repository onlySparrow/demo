import { Avatar, Badge, Dropdown } from 'antd'

import { MaterialIcon } from '../../../components/MaterialIcon'

import styles from './AppHeader.module.scss'

/** 系统名称 */
const APP_TITLE = '统一待办SPA应用'

/** 当前登录用户 —— TODO: 接统一认证后替换为真实信息 */
const currentUser = {
  name: '张工',
  level: 'L3',
  department: '浙江运维中心',
}

/**
 * 顶栏:左侧系统标识 + 插槽容器(内容由各页面通过 HeaderSlot 投入),
 * 右侧通知入口 + 用户信息。
 */
export function AppHeader({ slotRef }: { slotRef: (element: HTMLDivElement | null) => void }) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.title}>{APP_TITLE}</h1>
        {/* 页面插槽:tab / 文案 / 操作区,没内容时自动隐藏 */}
        <div className={styles.slot} ref={slotRef} />
      </div>

      <div className={styles.actions}>
        <Badge dot>
          <MaterialIcon name="notifications" className={styles.notifyIcon} />
        </Badge>

        <Dropdown
          menu={{
            items: [
              // TODO: 接入登出接口
              {
                key: 'logout',
                icon: <MaterialIcon name="logout" />,
                label: '退出登录',
                danger: true,
              },
            ],
          }}
        >
          <div className={styles.userInfo}>
            <div className={styles.userMeta}>
              <span className={styles.userName}>
                {currentUser.name} ({currentUser.level})
              </span>
              <span className={styles.userDept}>{currentUser.department}</span>
            </div>
            <Avatar className={styles.avatar}>{currentUser.name.slice(0, 1)}</Avatar>
          </div>
        </Dropdown>
      </div>
    </header>
  )
}
