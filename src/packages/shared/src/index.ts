/**
 * 共享工具函数与类型定义
 */
export function buildDetailRoute(sourceKey: string, todoId: string): string {
  return `/todo/${encodeURIComponent(sourceKey)}/${encodeURIComponent(todoId)}`
}

export type DetailRouteParams = {
  sourceKey: string
  todoId: string
}
