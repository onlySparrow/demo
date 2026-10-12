import { Button, Result } from 'antd'
import { Component, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'

import { HeaderSlot } from '../../layouts/BasicLayout/HeaderSlot'
import { HeaderTabs } from '../../layouts/BasicLayout/components/HeaderTabs'

import { TodoListMode } from './list-mode'
import { TodoMapMode } from './map-mode'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class MapErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[TodoPage] Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, background: '#fff', borderRadius: 8 }}>
          <Result
            status="warning"
            title="地图视图加载遇到异常"
            subTitle={this.state.error?.message || '地图初始化错误，请点击重试或返回列表模式'}
            extra={
              <Button type="primary" onClick={() => this.setState({ hasError: false })}>
                重新加载
              </Button>
            }
          />
        </div>
      )
    }
    return this.props.children
  }
}

/**
 * 待办视图 —— 顶栏切换列表 / 地图模式(模式落在地址栏 ?tab=)。
 */
export function TodoPage() {
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('tab') === 'map' ? 'map' : 'list'

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}>
      {/* 顶栏插槽:列表/地图模式切换 */}
      <HeaderSlot>
        <HeaderTabs
          options={[
            { key: 'list', label: '列表模式' },
            { key: 'map', label: '地图模式' },
          ]}
        />
      </HeaderSlot>
      {mode === 'map' ? (
        <MapErrorBoundary>
          <TodoMapMode />
        </MapErrorBoundary>
      ) : (
        <TodoListMode />
      )}
    </div>
  )
}
