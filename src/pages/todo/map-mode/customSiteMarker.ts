/**
 * 地图站点自定义标记样式。
 * 当前统一使用原型「丽水中心枢纽」样式（tertiary 棕 + cell_tower）。
 * 后续可按站点类型 / 紧急度扩展差异化图标。
 */

/** 丽水中心枢纽标准色（设计令牌 tertiary） */
export const CUSTOM_SITE_COLOR = '#934600'

/**
 * 生成百度地图可用的自定义图标 SVG DataURL。
 * 圆形底 + 基站天线符号，对齐原型丽水中心枢纽标记。
 */
export function buildCustomSiteIconDataUrl(options?: {
  /** 直径 px，默认 40 */
  size?: number
  /** 是否选中（加深描边） */
  selected?: boolean
  /** 是否已勾选（绿色外圈） */
  checked?: boolean
}): string {
  const size = options?.size ?? 40
  const selected = options?.selected ?? false
  const checked = options?.checked ?? false
  const r = size / 2
  const ring = checked ? '#22c55e' : selected ? '#005daa' : 'rgba(147, 70, 0, 0.35)'
  const ringWidth = checked || selected ? 3 : 4

  // 简化 cell_tower 图形：中心杆 + 两侧辐射弧
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <circle cx="${r}" cy="${r}" r="${r - ringWidth / 2}" fill="${CUSTOM_SITE_COLOR}" stroke="${ring}" stroke-width="${ringWidth}"/>
  <g fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <!-- 塔身 -->
    <path d="M${r} ${r + 10} L${r} ${r - 4}"/>
    <path d="M${r - 5} ${r + 10} L${r + 5} ${r + 10}"/>
    <!-- 天线臂 -->
    <path d="M${r - 7} ${r - 2} L${r} ${r - 8} L${r + 7} ${r - 2}"/>
    <!-- 信号弧 -->
    <path d="M${r - 9} ${r - 6} A10 10 0 0 1 ${r + 9} ${r - 6}"/>
    <path d="M${r - 6} ${r - 9} A6 6 0 0 1 ${r + 6} ${r - 9}"/>
  </g>
</svg>`.trim()

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

/** 创建百度地图 BMap.Icon（依赖 window.BMap） */
export function createBaiduCustomSiteIcon(
  BMap: any,
  options?: { selected?: boolean; checked?: boolean },
): any {
  const size = 40
  const url = buildCustomSiteIconDataUrl({ size, ...options })
  return new BMap.Icon(url, new BMap.Size(size, size), {
    imageSize: new BMap.Size(size, size),
    anchor: new BMap.Size(size / 2, size / 2),
  })
}
