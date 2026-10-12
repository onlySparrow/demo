import { useParams } from 'react-router'

import { TodoDetailHost } from '@unified-todo/micro-app'

/**
 * 待办详情页 —— 详情渲染交给 micro-app,本页只负责壳的职责。
 * sourceKey / todoId 从路由参数读取(路由可分享 / 刷新可恢复)。
 * TODO: 打开时 pushState、监听 popstate 关闭详情(单 webview 返回键的唯一解法)。
 */
export function TodoDetailPage() {
  const { sourceKey = '', todoId = '' } = useParams()

  return <TodoDetailHost platform="pc" sourceKey={sourceKey} todoId={todoId} />
}
