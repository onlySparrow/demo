import { Modal, Spin } from 'antd'
import { useEffect, useRef, useState } from 'react'

import { LocationOnIcon, PersonIcon } from '@/assets/icons'
import { loadBaiduMap } from '@/pages/todo/map-mode/BaiduMapLoader'
import type { TodoTicket } from './TodoTicketCard'

import styles from './SiteMapModal.module.scss'

/** 缺省中心(与地图模式一致,丽水中心枢纽) */
const DEFAULT_CENTER = { lng: 119.9228, lat: 28.455 }

/** 两点球面直线距离(米,BD09 坐标近似计算,展示粒度足够) */
function haversine(lng1: number, lat1: number, lng2: number, lat2: number): number {
  const rad = Math.PI / 180
  const dLat = (lat2 - lat1) * rad
  const dLng = (lng2 - lng1) * rad
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2
  return 6378137 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** 距离格式化:1km 内按米,超过按 km 保留 1 位 */
function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`
  return `${(meters / 1000).toFixed(1)}km`
}

/**
 * 站点位置弹窗 —— 点击详情面板缩略图打开,不再跳转地图模式:
 * 顶部(站点名称/站点ID/所属区域/直线距离) + 真实地图(左下角故障点与距用户距离)
 * + 详细地址 + 右下角关闭按钮。
 */
export function SiteMapModal({
  open,
  ticket,
  onClose,
}: {
  open: boolean
  ticket: TodoTicket
  onClose: () => void
}) {
  /** 容器 ref 回调驱动地图初始化(弹窗打开且容器挂载后才 init,规避隐藏容器坑) */
  const [mapEl, setMapEl] = useState<HTMLDivElement | null>(null)
  const markerRef = useRef<any>(null)
  const [mapLoading, setMapLoading] = useState(true)
  const [mapFailed, setMapFailed] = useState(false)
  /** 当前用户位置(geolocation),拿不到则直线距离显示 -- */
  const [userPos, setUserPos] = useState<{ lng: number; lat: number } | null>(null)

  const lng = ticket.lng ?? DEFAULT_CENTER.lng
  const lat = ticket.lat ?? DEFAULT_CENTER.lat
  const region = [ticket.province, ticket.district].filter(Boolean).join(' ') || '--'

  // 打开时尝试取用户位置;浏览器定位不可用/拒绝/超时时回落默认位置(丽水中心枢纽),
  // 保证「直线距离/距离当前用户」在演示环境也有数据 —— 定位成功则以真实位置覆盖
  useEffect(() => {
    if (!open) return
    const fallback = () => setUserPos(DEFAULT_CENTER)
    if (!navigator.geolocation) {
      fallback()
      return
    }
    const timer = window.setTimeout(() => {
      navigator.geolocation.clearWatch(watchId)
      fallback()
    }, 6000)
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPos({ lng: pos.coords.longitude, lat: pos.coords.latitude })
        navigator.geolocation.clearWatch(watchId)
        window.clearTimeout(timer)
      },
      () => {
        navigator.geolocation.clearWatch(watchId)
        window.clearTimeout(timer)
        fallback()
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 },
    )
    return () => {
      window.clearTimeout(timer)
      navigator.geolocation.clearWatch(watchId)
    }
  }, [open])

  // 地图初始化:工单坐标落故障点标记并居中
  useEffect(() => {
    if (!open || !mapEl) return
    let active = true
    setMapLoading(true)
    setMapFailed(false)

    loadBaiduMap()
      .then((BMap) => {
        if (!active) return
        mapEl.innerHTML = ''
        const map = new BMap.Map(mapEl)
        const point = new BMap.Point(lng, lat)
        map.centerAndZoom(point, 15)
        map.enableScrollWheelZoom(true)
        if (BMap.ScaleControl) {
          map.addControl(new BMap.ScaleControl({ anchor: BMap.BMAP_ANCHOR_BOTTOM_RIGHT }))
        }
        const marker = new BMap.Marker(point)
        map.addOverlay(marker)
        markerRef.current = marker
        setMapLoading(false)
      })
      .catch(() => {
        if (active) setMapFailed(true)
      })

    return () => {
      active = false
      try {
        markerRef.current = null
      } catch {
        // ignore
      }
    }
  }, [open, mapEl, lng, lat])

  const distanceText =
    userPos && ticket.lng != null && ticket.lat != null
      ? formatDistance(haversine(userPos.lng, userPos.lat, ticket.lng, ticket.lat))
      : '--'

  return (
    <Modal open={open} width={760} footer={null} closable={false} destroyOnHidden onCancel={onClose}>
      <div className={styles.wrap}>
        {/* 顶部:站点信息 4 项(label 上 / value 下,距离值主色蓝) */}
        <div className={styles.infoRow}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>站点名称</span>
            <span className={styles.infoValue} title={ticket.siteName}>
              {ticket.siteName || '--'}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>站点ID</span>
            <span className={styles.infoValue} title={ticket.siteId}>
              {ticket.siteId || '--'}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>所属区域</span>
            <span className={styles.infoValue} title={region}>
              {region}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>直线距离</span>
            <span
              className={`${styles.infoValue} ${styles.infoValuePrimary}`}
              title={distanceText}
            >
              {distanceText}
            </span>
          </div>
        </div>

        {/* 中间:真实地图 + 左下角图例 */}
        <div className={styles.mapBox}>
          <div ref={setMapEl} className={styles.mapCanvas} />
          {mapLoading && !mapFailed && (
            <div className={styles.mapMask}>
              <Spin size="small" />
            </div>
          )}
          {mapFailed && <div className={styles.mapMask}>地图服务加载失败</div>}
          <div className={styles.mapLegend}>
            <span className={styles.legendItem}>
              <LocationOnIcon className={styles.legendIcon} />
              <span className={styles.legendLabel}>故障点：</span>
              <span className={styles.legendValue}>{ticket.siteName || '--'}</span>
            </span>
            <span className={styles.legendItem}>
              <PersonIcon className={styles.legendIcon} />
              <span className={styles.legendLabel}>距离当前用户：</span>
              <span className={styles.legendValuePrimary}>{distanceText}</span>
            </span>
          </div>
        </div>

        {/* 详细地址 */}
        <div className={styles.addressRow}>
          <span className={styles.infoLabel}>详细地址：</span>
          <span className={styles.addressValue}>{ticket.address || '--'}</span>
        </div>

        {/* 右下角关闭 */}
        <div className={styles.footerRow}>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </Modal>
  )
}
