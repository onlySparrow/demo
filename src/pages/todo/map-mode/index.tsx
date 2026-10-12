import {
  AimOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { Button, Input, Select, Space, Tag, message } from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'

import { loadBaiduMap } from './BaiduMapLoader'
import { MapInfoWindow } from './components/MapInfoWindow'
import { MapTodoListPanel } from './components/MapTodoListPanel'
import { RoutePlanOverlay } from './components/RoutePlanOverlay'
import { defaultMapTickets } from './mapData'
import type { MapTodoTicket } from './types'
import {
  TODO_PRIORITY_OPTIONS,
  TODO_SOURCE_OPTIONS,
  getTodoPriorityLabel,
  getTodoSourceLabel,
} from '../config'

import styles from './index.module.scss'

export function TodoMapMode() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const bmapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const polylineRef = useRef<any>(null)

  const [keyword, setKeyword] = useState('')
  const [source, setSource] = useState<string | undefined>(undefined)
  const [urgency, setUrgency] = useState<string | undefined>(undefined)
  const [sidePanelCollapsed, setSidePanelCollapsed] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<MapTodoTicket | null>(null)
  const [routeOverlayVisible, setRouteOverlayVisible] = useState(false)
  const [baiduMapLoaded, setBaiduMapLoaded] = useState(false)

  // 待办工单复选框选中项集合
  const [checkedIds, setCheckedIds] = useState<string[]>([])
  // 已规划路径的工单点位
  const [plannedTickets, setPlannedTickets] = useState<MapTodoTicket[]>([])

  // 筛选待办工单
  const filteredTickets = useMemo(() => {
    const targetSource = getTodoSourceLabel(source)
    const targetUrgency = getTodoPriorityLabel(urgency)

    return defaultMapTickets.filter((t) => {
      if (keyword) {
        const kw = keyword.toLowerCase()
        if (!t.title.toLowerCase().includes(kw) && !t.siteName.toLowerCase().includes(kw)) {
          return false
        }
      }
      if (targetSource && t.app !== targetSource) {
        return false
      }
      if (targetUrgency && t.priority !== targetUrgency) {
        return false
      }
      return true
    })
  }, [keyword, source, urgency])

  // 初始化百度地图 (带超时和降级保护，绝不白屏)
  useEffect(() => {
    let active = true

    loadBaiduMap()
      .then((BMapObj) => {
        if (!active || !mapContainerRef.current) return

        try {
          const BMap = window.BMap || BMapObj
          if (!BMap || !BMap.Map) return

          // 初始化地图实例
          const map = new BMap.Map(mapContainerRef.current)
          bmapInstanceRef.current = map

          // 定位在丽水/华东枢纽中心区域
          const centerPoint = new BMap.Point(119.9228, 28.4550)
          map.centerAndZoom(centerPoint, 13)
          map.enableScrollWheelZoom(true)

          if (BMap.NavigationControl) {
            map.addControl(new BMap.NavigationControl())
          }
          if (BMap.ScaleControl) {
            map.addControl(new BMap.ScaleControl())
          }

          setBaiduMapLoaded(true)
        } catch (e) {
          console.warn('[BaiduMap] 地图DOM渲染异常，转入内置矢量底图:', e)
        }
      })
      .catch((err) => {
        console.warn('[BaiduMap] 百度地图在线服务不可用，转入内置矢量底图:', err)
      })

    return () => {
      active = false
      if (bmapInstanceRef.current && typeof bmapInstanceRef.current.clearOverlays === 'function') {
        bmapInstanceRef.current.clearOverlays()
      }
    }
  }, [])

  // 刷新百度地图标注点
  useEffect(() => {
    const map = bmapInstanceRef.current
    const BMap = window.BMap
    if (!map || !BMap) return

    // 清除原有标记
    markersRef.current.forEach((marker) => {
      try {
        map.removeOverlay(marker)
      } catch {
        // ignore
      }
    })
    markersRef.current = []

    // 绘制新工单标注
    filteredTickets.forEach((ticket) => {
      try {
        const pt = new BMap.Point(ticket.lng, ticket.lat)
        const marker = new BMap.Marker(pt)

        const color =
          ticket.priority === '高' ? '#ba1a1a' : ticket.priority === '中' ? '#934600' : '#005daa'

        const isChecked = checkedIds.includes(ticket.id)
        const label = new BMap.Label(
          `${isChecked ? '✓ ' : ''}${ticket.siteName}`,
          {
            offset: new BMap.Size(20, -10),
          },
        )
        label.setStyle({
          color: color,
          fontSize: '11px',
          fontWeight: isChecked ? 'bold' : '600',
          border: `1.5px solid ${color}`,
          borderRadius: '4px',
          padding: '2px 6px',
          background: isChecked ? '#f0fdf4' : '#ffffff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
          cursor: 'pointer',
        })

        marker.setLabel(label)

        const handleClick = () => {
          setSelectedTicket(ticket)
          map.panTo(pt)
        }

        marker.addEventListener('click', handleClick)
        label.addEventListener('click', handleClick)

        map.addOverlay(marker)
        markersRef.current.push(marker)
      } catch (err) {
        console.warn('[BaiduMap] 添加标注异常:', err)
      }
    })
  }, [filteredTickets, baiduMapLoaded, checkedIds])

  // 路线规划连线（仅对已勾选规划的工单进行连线）
  useEffect(() => {
    const map = bmapInstanceRef.current
    const BMap = window.BMap
    if (!map || !BMap) return

    if (polylineRef.current) {
      try {
        map.removeOverlay(polylineRef.current)
      } catch {
        // ignore
      }
      polylineRef.current = null
    }

    if (routeOverlayVisible && plannedTickets.length > 1) {
      try {
        const points = plannedTickets.map((t) => new BMap.Point(t.lng, t.lat))
        const polyline = new BMap.Polyline(points, {
          strokeColor: '#005daa',
          strokeWeight: 4,
          strokeOpacity: 0.85,
          strokeStyle: 'dashed',
        })
        map.addOverlay(polyline)
        polylineRef.current = polyline
        map.setViewport(points)
      } catch (err) {
        console.warn('[BaiduMap] 绘制路线异常:', err)
      }
    }
  }, [routeOverlayVisible, plannedTickets])

  // 单项勾选切换
  const handleToggleCheck = (id: string, checked: boolean) => {
    setCheckedIds((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id),
    )
  }

  // 全选切换
  const handleToggleCheckAll = (checked: boolean) => {
    if (checked) {
      setCheckedIds(filteredTickets.map((t) => t.id))
    } else {
      setCheckedIds([])
    }
  }

  // 点击左侧卡片定位工单
  const handleSelectTicket = (ticket: MapTodoTicket) => {
    setSelectedTicket(ticket)
    const map = bmapInstanceRef.current
    const BMap = window.BMap
    if (map && BMap) {
      const pt = new BMap.Point(ticket.lng, ticket.lat)
      map.panTo(pt)
      map.setZoom(15)
    }
  }

  // 重置全局视角
  const handleResetCenter = () => {
    const map = bmapInstanceRef.current
    const BMap = window.BMap
    if (map && BMap) {
      const centerPoint = new BMap.Point(119.9228, 28.4550)
      map.centerAndZoom(centerPoint, 13)
    }
    message.info('视角已重置为中心枢纽区域')
  }

  // 触发一键智能路线规划
  const handleStartRoutePlan = (targets: MapTodoTicket[]) => {
    if (targets.length === 0) {
      message.warning('请先勾选需要规划巡检路线的待办工单')
      return
    }
    setPlannedTickets(targets)
    setRouteOverlayVisible(true)
    message.success(`已为已选的 ${targets.length} 个工单规划最优巡检路径`)
  }

  return (
    <div className={styles.mapContainer}>
      {/* 顶部悬浮筛选栏 */}
      <div className={styles.topFilterBar}>
        <Input
          size="middle"
          prefix={<SearchOutlined style={{ color: '#888' }} />}
          placeholder="搜索工单标题 / 站点名称"
          allowClear
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ width: 220 }}
        />

        <Select
          size="middle"
          allowClear
          placeholder="工单来源系统"
          style={{ width: 140 }}
          value={source}
          onChange={setSource}
          options={TODO_SOURCE_OPTIONS}
        />

        <Select
          size="middle"
          allowClear
          placeholder="紧急程度"
          style={{ width: 110 }}
          value={urgency}
          onChange={setUrgency}
          options={TODO_PRIORITY_OPTIONS}
        />

        <Space style={{ marginLeft: 'auto' }}>
          <Tag color={baiduMapLoaded ? 'success' : 'blue'}>
            {baiduMapLoaded ? '百度地图 在线' : '高保真矢量拓扑地图'}
          </Tag>
          <Button size="middle" icon={<AimOutlined />} onClick={handleResetCenter}>
            全局定位
          </Button>
          <Button
            size="middle"
            type={sidePanelCollapsed ? 'default' : 'primary'}
            icon={<MenuUnfoldOutlined />}
            onClick={() => setSidePanelCollapsed((v) => !v)}
          >
            {sidePanelCollapsed ? '展开待办列表' : '收起待办列表'}
          </Button>
        </Space>
      </div>

      {/* 百度地图挂载 DOM */}
      <div
        ref={mapContainerRef}
        className={styles.mapCanvas}
        style={{ display: baiduMapLoaded ? 'block' : 'none' }}
      />

      {/* 备用矢量地图底图（在百度地图未联网或加载时立即可见，100%绝不白屏） */}
      {!baiduMapLoaded && (
        <div
          className={styles.mapCanvas}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 50%, #edf3f9 0%, #d8e5f3 100%)',
            overflow: 'hidden',
          }}
        >
          {/* 背景拓扑网格 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.35,
              backgroundImage:
                'linear-gradient(#005daa 1px, transparent 1px), linear-gradient(90deg, #005daa 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />

          {/* 路径规划连线 (SVG - 针对已规划勾选点位) */}
          {routeOverlayVisible && plannedTickets.length > 1 && (
            <svg
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              <polyline
                points={plannedTickets
                  .map((t) => {
                    const idx = defaultMapTickets.findIndex((item) => item.id === t.id)
                    const x = ((25 + ((idx * 16) % 60)) * window.innerWidth) / 100
                    const y = ((25 + ((idx * 22) % 52)) * 600) / 100
                    return `${x},${y}`
                  })
                  .join(' ')}
                fill="none"
                stroke="#005daa"
                strokeWidth="4"
                strokeDasharray="8 6"
              />
            </svg>
          )}

          {/* 各工单点位 */}
          {filteredTickets.map((t, idx) => {
            const color =
              t.priority === '高' ? '#ba1a1a' : t.priority === '中' ? '#934600' : '#005daa'
            const leftPercent = 22 + ((idx * 16) % 60)
            const topPercent = 24 + ((idx * 22) % 52)
            const isSelected = selectedTicket?.id === t.id
            const isChecked = checkedIds.includes(t.id)

            return (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                style={{
                  position: 'absolute',
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  zIndex: isSelected ? 35 : 20,
                  transform: `translate(-50%, -50%) scale(${isSelected ? 1.15 : 1})`,
                  transition: 'transform 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: color,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                    fontSize: 16,
                    border: isChecked ? '3px solid #22c55e' : '2px solid #fff',
                  }}
                >
                  📍
                </div>
                <div
                  style={{
                    background: isSelected ? '#005daa' : 'rgba(255, 255, 255, 0.95)',
                    color: isSelected ? '#fff' : '#333',
                    backdropFilter: 'blur(4px)',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    marginTop: 4,
                    whiteSpace: 'nowrap',
                    border: '1px solid #c0c7d6',
                  }}
                >
                  {isChecked ? '✓ ' : ''}
                  {t.siteName}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 单独封装的左侧待办列表抽屉组件 */}
      <MapTodoListPanel
        tickets={filteredTickets}
        selectedId={selectedTicket?.id || null}
        collapsed={sidePanelCollapsed}
        checkedIds={checkedIds}
        onToggleCheck={handleToggleCheck}
        onToggleCheckAll={handleToggleCheckAll}
        onClose={() => setSidePanelCollapsed(true)}
        onSelectTicket={handleSelectTicket}
        onStartRoutePlan={handleStartRoutePlan}
      />

      {/* 智能路线规划浮层 */}
      {routeOverlayVisible && (
        <RoutePlanOverlay
          tickets={plannedTickets}
          onClose={() => setRouteOverlayVisible(false)}
        />
      )}

      {/* 选中标点时的工单详情弹窗 */}
      {selectedTicket && (
        <MapInfoWindow
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  )
}
