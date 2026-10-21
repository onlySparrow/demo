declare global {
  interface Window {
    BMap?: any
    BMAP_PROTOCOL?: string
    BMap_loadScriptTime?: number
  }
}

let loadPromise: Promise<any> | null = null

/**
 * 动态加载百度地图 JavaScript API
 * 直接加载 getscript 核心库，彻底规避 api.js 中的 document.write 导致 SPA 应用白屏的问题
 */
export function loadBaiduMap(): Promise<any> {
  if (typeof window !== 'undefined' && window.BMap && window.BMap.Map) {
    return Promise.resolve(window.BMap)
  }

  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    try {
      const ak = import.meta.env.VITE_BAIDU_MAP_AK || 'E4805d16520de693a3fe707cdc962045'
      window.BMAP_PROTOCOL = 'https'
      window.BMap_loadScriptTime = new Date().getTime()

      const scriptId = 'baidu-map-getscript'
      let script = document.getElementById(scriptId) as HTMLScriptElement | null

      if (!script) {
        script = document.createElement('script')
        script.id = scriptId
        script.type = 'text/javascript'
        script.src = `https://api.map.baidu.com/getscript?v=3.0&ak=${ak}&services=`
        script.async = true

        script.onload = () => {
          if (window.BMap && window.BMap.Map) {
            resolve(window.BMap)
          } else {
            reject(new Error('BMap not found after script loaded'))
          }
        }

        script.onerror = (err) => {
          console.warn('[BaiduMap] 百度地图加载网络受限，自动启用内置高清拓扑底图:', err)
          reject(err)
        }

        document.head.appendChild(script)
      } else {
        if (window.BMap && window.BMap.Map) {
          return resolve(window.BMap)
        }
      }

      // 3 秒超时保底，保证任何网络异常都不会阻断页面渲染
      setTimeout(() => {
        if (window.BMap && window.BMap.Map) {
          resolve(window.BMap)
        } else {
          reject(new Error('Baidu Map load timeout'))
        }
      }, 3000)
    } catch (err) {
      reject(err)
    }
  })

  return loadPromise
}
