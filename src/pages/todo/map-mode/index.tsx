import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { message } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'

import { loadBaiduMap } from './BaiduMapLoader'
import { MapInfoWindow, type MapInfoWindowPosition } from './components/MapInfoWindow'
import { MapTicketDetailModal } from './components/MapTicketDetailModal'
import {
  CUSTOM_SITE_COLOR,
  createBaiduCustomSiteIcon,
} from './customSiteMarker'
import type { MapTodoTicket } from './types'
import { fetchTodoList, type TodoTicket } from '@/api/todo'
import { CellTowerFillIcon } from '@/assets/icons'
// 智能工具箱整体注释隐藏(2026-10-14 需求),恢复时取消下行注释即可
// import { SmartToolbox } from '../components/SmartToolbox'
import { TodoListPanel } from '../components/TodoListPanel'

import styles from './index.module.scss'

/** 中心枢纽坐标(工单缺省坐标时的演示落点基准,与 todoMock 保持一致) */
const MAP_CENTER = { lng: 119.9228, lat: 28.455 }

/** 待办列表接口数据 → 地图模式工单(同一接口数据,按经纬度落点;缺省坐标围绕中心枢纽铺开) */
function adaptToMapTicket(ticket: TodoTicket, index: number): MapTodoTicket {
  return {
    ...ticket,
    lng: ticket.lng ?? MAP_CENTER.lng + ((index % 5) - 2) * 0.01,
    lat: ticket.lat ?? MAP_CENTER.lat + ((Math.floor(index / 5) % 5) - 2) * 0.01,
    siteName: ticket.siteName || '未命名站点',
    address: ticket.address || '',
    sla: ticket.slaLevel,
  }
}

export function TodoMapMode() {
  const [searchParams, setSearchParams] = useSearchParams()
  const focusId = searchParams.get('focusId')
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const bmapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  /** 最近一次定位的工单 id:平移落位后的气泡校准只对最新目标生效 */
  const latestFocusIdRef = useRef<string | null>(null)

  const [sidePanelCollapsed, setSidePanelCollapsed] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<MapTodoTicket | null>(null)
  /** 气泡相对地图容器的像素位置 */
  const [infoPos, setInfoPos] = useState<MapInfoWindowPosition | null>(null)
  /** 查看工单详情大弹窗 */
  const [detailOpen, setDetailOpen] = useState(false)
  /** 备用矢量底图缩放级别 */
  const [fallbackZoom, setFallbackZoom] = useState(1)
  const [baiduMapLoaded, setBaiduMapLoaded] = useState(false)

  // 待办工单复选框选中项集合(左侧列表勾选 → 标注 ✓ 态)
  const [checkedIds, setCheckedIds] = useState<string[]>([])

  /** 待办工单数据 —— 与列表模式共用 fetchTodoList 接口(一次拉全量供地图落点) */
  const [tickets, setTickets] = useState<MapTodoTicket[]>([])

  /** 拉全量待办工单落地图标注(初始 + 左侧列表批量流转/刷新后联动) */
  const fetchTickets = useCallback(() => {
    fetchTodoList({ page: 1, pageSize: 200 })
      .then((res) => {
        setTickets((res?.list ?? []).map(adaptToMapTicket))
      })
      .catch((error) => {
        console.error('[todo-map] 获取待办列表失败:', error)
        message.error('获取待办列表失败')
      })
  }, [])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  /** 根据经纬度计算气泡在容器内的像素坐标（百度地图） */
  const resolveBaiduPixel = (ticket: MapTodoTicket): MapInfoWindowPosition | null => {
    const map = bmapInstanceRef.current
    const container = mapContainerRef.current
    if (!map || !container) return null
    try {
      const pt = new window.BMap.Point(ticket.lng, ticket.lat)
      // pointToPixel 相对地图容器；pointToOverlayPixel 相对浮层坐标系
      const pixel =
        typeof map.pointToPixel === 'function'
          ? map.pointToPixel(pt)
          : map.pointToOverlayPixel(pt)
      if (!pixel) return null
      const w = container.clientWidth
      const h = container.clientHeight
      // 钳制，避免气泡跑出可视区导致“看不见”
      const left = Math.min(Math.max(pixel.x, 140), Math.max(140, w - 140))
      const top = Math.min(Math.max(pixel.y, 120), Math.max(120, h - 40))
      return { left, top }
    } catch {
      return null
    }
  }

  /** 备用矢量底图：按索引估算像素位置 */
  const resolveFallbackPixel = (ticket: MapTodoTicket): MapInfoWindowPosition => {
    const idx = tickets.findIndex((item) => item.id === ticket.id)
    const i = idx >= 0 ? idx : 0
    const leftPercent = 22 + ((i * 16) % 60)
    const topPercent = 24 + ((i * 22) % 52)
    const container = mapContainerRef.current
    const w = container?.clientWidth || window.innerWidth
    const h = container?.clientHeight || 600
    return { left: (leftPercent / 100) * w, top: (topPercent / 100) * h }
  }

  const openTicketPopup = (ticket: MapTodoTicket, pos?: MapInfoWindowPosition) => {
    const position =
      pos ||
      (baiduMapLoaded ? resolveBaiduPixel(ticket) : null) ||
      resolveFallbackPixel(ticket)
    setSelectedTicket(ticket)
    setInfoPos(position)
  }

  /** 工单当前是否在地图可视范围内(决定立即弹气泡还是等地图落位) */
  const isTicketVisible = (ticket: MapTodoTicket): boolean => {
    const map = bmapInstanceRef.current
    const container = mapContainerRef.current
    if (!map || !container || typeof map.pointToPixel !== 'function') return false
    try {
      const pixel = map.pointToPixel(new window.BMap.Point(ticket.lng, ticket.lat))
      return (
        pixel.x >= 0 &&
        pixel.x <= container.clientWidth &&
        pixel.y >= 0 &&
        pixel.y <= container.clientHeight
      )
    } catch {
      return false
    }
  }

  /**
   * 定位工单并弹出气泡。
   * 注意:panTo/setZoom 是动画,动画进行中 pointToPixel 拿到的是中间态视口,
   * 换算出的像素会严重偏离(首次定位视野外工单会把气泡钳到左上角)。
   * - 列表点选(需要放大):用瞬时 centerAndZoom,跳转完成后同步换算像素,规避动画中间态;
   * - 地图标记点选(不放大):平移落位后按 moveend/zoomend 再校准。
   */
  const flyToTicket = (ticket: MapTodoTicket, options?: { zoom?: boolean }) => {
    const map = bmapInstanceRef.current
    const BMap = window.BMap
    latestFocusIdRef.current = ticket.id
    if (!map || !BMap) {
      openTicketPopup(ticket)
      return
    }
    if (options?.zoom) {
      // 瞬时跳转(无平移动画),投影立即按最终视口更新
      try {
        map.centerAndZoom(new BMap.Point(ticket.lng, ticket.lat), 15)
      } catch {
        // ignore
      }
      // 下一帧换算像素,保证地图内部投影已完成刷新(与深链 focusId 路径一致)
      window.requestAnimationFrame(() => {
        if (latestFocusIdRef.current !== ticket.id) return
        openTicketPopup(ticket)
      })
      return
    }
    const settle = () => {
      if (latestFocusIdRef.current !== ticket.id) return
      openTicketPopup(ticket)
    }
    // 已在视野内:先按当前位置立即弹出(地图静止时换算准确)
    if (isTicketVisible(ticket)) {
      openTicketPopup(ticket)
    }
    map.addEventListener('moveend', settle)
    map.addEventListener('zoomend', settle)
    window.setTimeout(() => {
      map.removeEventListener('moveend', settle)
      map.removeEventListener('zoomend', settle)
      // 兜底:地图未产生移动事件(已在目标位置)时也保证气泡已弹出
      settle()
    }, 800)
    map.panTo(new BMap.Point(ticket.lng, ticket.lat))
  }

  // 从列表详情缩略图跳转：定位工单并弹出概要
  useEffect(() => {
    if (!focusId) return
    const ticket = tickets.find((t) => t.id === focusId)
    if (!ticket) return

    const run = () => {
      const map = bmapInstanceRef.current
      const BMap = window.BMap
      if (map && BMap) {
        // centerAndZoom 为瞬时跳转(无平移动画),跳完后同步计算像素即为最终位置
        map.centerAndZoom(new BMap.Point(ticket.lng, ticket.lat), 15)
        latestFocusIdRef.current = ticket.id
      }
      openTicketPopup(ticket)
      // 消费 focusId，避免反复触发
      const next = new URLSearchParams(searchParams)
      next.delete('focusId')
      // 保留 tab=map
      if (!next.get('tab')) next.set('tab', 'map')
      setSearchParams(next, { replace: true })
    }

    // 等待地图/列表就绪
    const timer = window.setTimeout(run, baiduMapLoaded ? 200 : 80)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId, baiduMapLoaded, tickets])

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

          // 使用自定义右下角缩放控件，不启用百度默认导航控件（左上角）
          if (BMap.ScaleControl) {
            map.addControl(new BMap.ScaleControl({ anchor: BMap.BMAP_ANCHOR_BOTTOM_LEFT }))
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

    // 绘制新工单标注 —— 每个站点使用自定义样式（统一丽水中心枢纽：cell_tower + tertiary）
    tickets.forEach((ticket) => {
      try {
        const pt = new BMap.Point(ticket.lng, ticket.lat)
        const isChecked = checkedIds.includes(ticket.id)
        const isSelected = selectedTicket?.id === ticket.id
        const icon = createBaiduCustomSiteIcon(BMap, {
          checked: isChecked,
          selected: isSelected,
        })
        const marker = new BMap.Marker(pt, { icon })

        const label = new BMap.Label(`${isChecked ? '✓ ' : ''}${ticket.siteName}`, {
          offset: new BMap.Size(22, -8),
        })
        label.setStyle({
          color: isSelected ? '#005daa' : CUSTOM_SITE_COLOR,
          fontSize: '11px',
          fontWeight: isSelected || isChecked ? '700' : '600',
          border: `1.5px solid ${isSelected ? '#005daa' : CUSTOM_SITE_COLOR}`,
          borderRadius: '4px',
          padding: '2px 8px',
          background: isSelected ? '#e8f0fe' : isChecked ? '#f0fdf4' : '#ffffff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
          cursor: 'pointer',
        })

        marker.setLabel(label)

        const handleClick = () => {
          // 定位到工单并弹出气泡(平移落位后自动校准,避免动画中间态坐标错乱)
          flyToTicket(ticket)
        }

        marker.addEventListener('click', handleClick)
        label.addEventListener('click', handleClick)

        map.addOverlay(marker)
        markersRef.current.push(marker)
      } catch (err) {
        console.warn('[BaiduMap] 添加标注异常:', err)
      }
    })
  }, [tickets, baiduMapLoaded, checkedIds, selectedTicket])

  // 点击左侧列表卡片:定位工单并弹出气泡(自动放大到 15 级)
  const handleSelectTicket = (ticket: TodoTicket) => {
    const target = tickets.find((t) => t.id === ticket.id)
    if (!target) return
    flyToTicket(target, { zoom: true })
  }

  /** 地图放大 */
  const handleZoomIn = () => {
    const map = bmapInstanceRef.current
    if (map && typeof map.zoomIn === 'function') {
      map.zoomIn()
      return
    }
    setFallbackZoom((z) => Math.min(2.4, Number((z + 0.2).toFixed(2))))
  }

  /** 地图缩小 */
  const handleZoomOut = () => {
    const map = bmapInstanceRef.current
    if (map && typeof map.zoomOut === 'function') {
      map.zoomOut()
      return
    }
    setFallbackZoom((z) => Math.max(0.6, Number((z - 0.2).toFixed(2))))
  }

  return (
    <div className={styles.mapContainer}>
      {/* 百度地图挂载 DOM —— 始终占位:容器必须带真实尺寸初始化,
          display:none 时创建地图会让 BMap 视口/坐标换算整体偏移(首点气泡错位到左上角的根因);
          加载期间空容器被上方的矢量兜底图覆盖,无视觉影响 */}
      <div ref={mapContainerRef} className={styles.mapCanvas} />

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
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transform: `scale(${fallbackZoom})`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease',
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

          {/* 各工单点位 —— 自定义站点样式（统一丽水中心枢纽：cell_tower + tertiary） */}
          {tickets.map((t, idx) => {
            const leftPercent = 22 + ((idx * 16) % 60)
            const topPercent = 24 + ((idx * 22) % 52)
            const isSelected = selectedTicket?.id === t.id
            const isChecked = checkedIds.includes(t.id)

            return (
              <div
                key={t.id}
                className={`${styles.siteMarker} ${isSelected ? styles.siteMarkerActive : ''} ${isChecked ? styles.siteMarkerChecked : ''}`}
                style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                onClick={(e) => {
                  const container = mapContainerRef.current
                  const rect = container?.getBoundingClientRect()
                  const markerRect = e.currentTarget.getBoundingClientRect()
                  if (rect) {
                    openTicketPopup(t, {
                      left: markerRect.left - rect.left + markerRect.width / 2,
                      top: markerRect.top - rect.top + markerRect.height / 2,
                    })
                  } else {
                    openTicketPopup(t)
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openTicketPopup(t)
                  }
                }}
                title={t.title}
              >
                <div className={styles.siteMarkerDot}>
                  <CellTowerFillIcon aria-hidden />
                </div>
                <div className={styles.siteMarkerLabel}>
                  {isChecked ? '✓ ' : ''}
                  {t.siteName}
                </div>
              </div>
            )
          })}
          </div>
        </div>
      )}

      {/* 左侧待办列表侧栏:与列表模式共用的 TodoListPanel(筛选/卡片/批量通过驳回/分页),
          右缘圆角按钮展开/收起(收起后按钮贴地图左缘) */}
      <div
        className={`${styles.sideListWrap} ${sidePanelCollapsed ? styles.sideListWrapCollapsed : ''}`}
      >
        <div
          className={`${styles.sideListPanel} ${sidePanelCollapsed ? styles.sideListPanelCollapsed : ''}`}
        >
          <TodoListPanel
            activeId={selectedTicket?.id ?? null}
            onSelectTicket={handleSelectTicket}
            onSelectedChange={setCheckedIds}
            onDataRefresh={fetchTickets}
          />
        </div>
        <button
          type="button"
          className={styles.listToggleBtn}
          onClick={() => setSidePanelCollapsed((v) => !v)}
          title={sidePanelCollapsed ? '展开待办列表' : '收起待办列表'}
          aria-label={sidePanelCollapsed ? '展开待办列表' : '收起待办列表'}
        >
          {sidePanelCollapsed ? <RightOutlined /> : <LeftOutlined />}
        </button>
      </div>

      {/* 选中标点时的气泡 —— 锚定在机房位置 */}
      {selectedTicket && infoPos && (
        <MapInfoWindow
          ticket={selectedTicket}
          position={infoPos}
          onClose={() => {
            setSelectedTicket(null)
            setInfoPos(null)
          }}
          onViewDetail={() => setDetailOpen(true)}
        />
      )}

      {/* 地图放大 / 缩小 */}
      <div className={styles.zoomControl}>
        <button type="button" className={styles.zoomBtn} onClick={handleZoomIn} title="放大" aria-label="放大">
          +
        </button>
        <button type="button" className={styles.zoomBtn} onClick={handleZoomOut} title="缩小" aria-label="缩小">
          −
        </button>
      </div>

      {/* 查看工单详情大弹窗 */}
      {selectedTicket && (
        <MapTicketDetailModal
          open={detailOpen}
          ticket={selectedTicket}
          onClose={() => setDetailOpen(false)}
        />
      )}

      {/* 地图模式工具箱:整体注释隐藏(2026-10-14 需求),恢复时取消注释即可
      <SmartToolbox
        mode="map"
        visible
        ticketId={selectedTicket?.id}
        ticketNo={selectedTicket?.ticketNo}
        siteName={selectedTicket?.siteName}
        ticketTitle={selectedTicket?.title}
      />
      */}
    </div>
  )
}
