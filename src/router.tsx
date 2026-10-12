import { Result } from 'antd'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'

import { BasicLayout } from './layouts/BasicLayout/BasicLayout'
import { DonePage } from './pages/done/DonePage'
import { InitiatedPage } from './pages/initiated/InitiatedPage'
import { PendingOrderPage } from './pages/pending-order'
import { PerformancePage } from './pages/performance/PerformancePage'
import { ReadNoticePage } from './pages/read-notice/ReadNoticePage'
import { routes } from './routes'
import { TodoDetailPage } from './pages/TodoDetailPage'
import { TodoPage } from './pages/todo/TodoPage'
import { UnreadNoticePage } from './pages/unread-notice/UnreadNoticePage'

/** 详情路径模式 —— 与 shared 的 buildDetailRoute 生成的地址保持一致 */
const DETAIL_PATH = '/todo/:sourceKey/:todoId'

/**
 * 路由树:菜单视图统一走 BasicLayout 主框架,详情路由全屏承载。
 */
export function AppRouter() {
  return (
    <BrowserRouter>
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

        {/* 详情路由不进主框架,给子系统嵌入留满屏空间 */}
        <Route path={DETAIL_PATH} element={<TodoDetailPage />} />
        <Route path="*" element={<Result status="404" title="404" subTitle="页面不存在或已下线" />} />
      </Routes>
    </BrowserRouter>
  )
}
