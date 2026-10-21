import { get } from '@/utils/request'

/** 各菜单角标数量 —— key 为菜单路由地址(与 menuConfig 的 key 一致) */
export type MenuBadgeCounts = Record<string, number>

/**
 * 查询各菜单待处理数量。
 * TODO: 路径与响应结构以统一待办服务真实接口为准。
 */
export function fetchMenuBadgeCounts(): Promise<MenuBadgeCounts> {
  return get<MenuBadgeCounts>('/menu/badge-counts')
}
