import { CloseOutlined, CompassOutlined } from '@ant-design/icons'
import { Button, Tag } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'

import type { MapTodoTicket } from '../types'

import styles from '../index.module.scss'

/**
 * 智能路径已生成浮层 —— 支持拖拽位置
 */
export function RoutePlanOverlay({
  tickets,
  onClose,
}: {
  tickets: MapTodoTicket[]
  onClose: () => void
}) {
  const stops = tickets.slice(0, 5).map((t) => t.siteName)
  const panelRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 80, right: 24 })
  const dragRef = useRef<{
    startX: number
    startY: number
    originTop: number
    originRight: number
  } | null>(null)

  const onMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      // 仅标题栏可拖
      if ((e.target as HTMLElement).closest('button')) return
      e.preventDefault()
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        originTop: pos.top,
        originRight: pos.right,
      }
    },
    [pos],
  )

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      setPos({
        top: Math.max(8, dragRef.current.originTop + dy),
        right: Math.max(8, dragRef.current.originRight - dx),
      })
    }
    const onUp = () => {
      dragRef.current = null
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  return (
    <div
      ref={panelRef}
      className={`${styles.routeOverlay} ${styles.routeOverlayDraggable}`}
      style={{ top: pos.top, right: pos.right, left: 'auto' }}
    >
      <div className={styles.routeOverlayHandle} onMouseDown={onMouseDown}>
        <div className={styles.routeOverlayTitle}>
          <CompassOutlined />
          <span>智能路径已生成</span>
        </div>
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={onClose}
          style={{ color: '#999' }}
        />
      </div>

      <div className={styles.routeOverlayBody}>
        <div className={styles.routeMetaRow}>
          <span>预计总里程: 12.4 km</span>
          <Tag color="success" style={{ margin: 0, fontSize: 10 }}>
            路况顺畅
          </Tag>
        </div>

        <div className={styles.routeMetaText}>
          预计总时长: <strong>45 分钟</strong> | 覆盖 <strong>{tickets.length}</strong> 个工单点
        </div>

        <div className={styles.routeStops}>
          <div className={styles.routeStopsTitle}>推荐巡检次序:</div>
          <div>
            {stops.join(' → ')}
            {tickets.length > 5 ? ' → ...' : ''}
          </div>
        </div>

        <Button danger size="small" onClick={onClose} block style={{ marginTop: 6 }}>
          取消路径规划
        </Button>
      </div>
    </div>
  )
}
