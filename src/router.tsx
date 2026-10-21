import { Result } from 'antd'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'

import { BasicLayout } from './layouts/BasicLayout'
import { DonePage } from './pages/done'
import { InitiatedPage } from './pages/createdByMe'
import { PendingOrderPage } from './pages/pendingAccept'
import { PerformancePage } from './pages/performance/PerformancePage'
import { ReadNoticePage } from './pages/read'
import { routes } from './routes'
import { TodoPage } from './pages/todo'
import { UnreadNoticePage } from './pages/pendingRead'

/** 部署上下文:构建为 /unifiedTodo/(nginx 子路径),开发为 /,路由 basename 随 BASE_URL */
const BASENAME = import.meta.env.BASE_URL.replace(/\/+$/, '') || '/'

/**
 * 路由树:菜单视图统一走 BasicLayout 主框架,详情路由全屏承载。
 */
export function AppRouter() {
  return (
    <BrowserRouter basename={BASENAME}>
      <Routes>
        <Route element={<BasicLayout />}>
          <Route path="/" element={<Navigate to={routes.todo} replace />} />
          <Route path={routes.todo} element={<TodoPage />} />
          <Route path={routes.pendingOrder} element={<PendingOrderPage />} />
          <Route path={routes.done} element={<DonePage />} />
          <Route path={routes.unreadNotice} element={<UnreadNoticePage />} />
          <Route path={routes.readNotice} element={<ReadNoticePage />} />
          <Route path={routes.initiated} element={<InitiatedPage />} />
          <Route path={routes.performance} element={<PerformancePage />} />
        </Route>

        <Route path="*" element={<Result status="404" title="404" subTitle="页面不存在或已下线" />} />
      </Routes>
    </BrowserRouter>
  )
}
