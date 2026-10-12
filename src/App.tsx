import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import 'dayjs/locale/zh-cn'

import { AppRouter } from './router'
import { antdTheme } from './theme'

/**
 * PC 壳入口:主题 / 中文语境 + 路由。
 * TODO: 桌面布局(侧栏 + 列表 + 详情分栏)待实现。
 */
export default function App() {
  return (
    <ConfigProvider locale={zhCN} theme={antdTheme}>
      <AppRouter />
    </ConfigProvider>
  )
}
