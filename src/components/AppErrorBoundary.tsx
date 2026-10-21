import { Button, Result } from 'antd'
import { Component, type ErrorInfo, type ReactNode } from 'react'

/**
 * 应用级错误边界 —— 任意渲染异常降级为错误提示页(避免整页白屏),
 * 联调期间(如接口返回结构与契约不符)能直接看到原因而不是空白页面。
 */
export class AppErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[app] 渲染异常:', error, info?.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <Result
          status="error"
          title="页面出错了"
          subTitle={this.state.error.message || '发生未知错误，请刷新重试'}
          extra={
            <Button type="primary" onClick={() => window.location.reload()}>
              刷新重试
            </Button>
          }
        />
      )
    }
    return this.props.children
  }
}
