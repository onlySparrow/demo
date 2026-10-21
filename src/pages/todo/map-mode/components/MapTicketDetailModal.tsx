import { Modal } from 'antd'
import { useEffect, useState } from 'react'

import { fetchTodoDetail } from '@/api/todo'

import { TicketDetail } from '../../components/TicketDetail'

import type { MapTodoTicket } from '../types'

import styles from './MapTicketDetailModal.module.scss'

/**
 * 地图模式 — 查看工单详情大弹窗：内容与列表模式右侧面板共用 TicketDetail
 * (16字段 + 处理时效 + 故障现象 + 流转记录 + 现场记录/关联告警/附件/操作日志 + 转派)。
 * 差异：地图模式已在地图上,不展示站点缩略图(showMiniMap=false),顶栏改为关闭按钮。
 *
 * 打开时调详情接口回填(列表数据先渲染,detail 返回后合并 —— 与列表模式同款策略,
 * 详情独有字段如工单描述/现场处理记录等随详情下发)。
 */
export function MapTicketDetailModal({
  open,
  ticket,
  onClose,
}: {
  open: boolean
  ticket: MapTodoTicket
  onClose: () => void
}) {
  const [detail, setDetail] = useState<MapTodoTicket>(ticket)

  useEffect(() => {
    if (!open) return
    // 先用标注数据即时渲染,详情返回后合并(保留地图落点坐标)
    setDetail(ticket)
    fetchTodoDetail(ticket.id)
      .then((full) => {
        setDetail((prev) => ({ ...prev, ...full, lng: prev.lng, lat: prev.lat }))
      })
      .catch((error) => {
        console.error('[todo-map] 获取工单详情失败:', error)
      })
  }, [open, ticket])

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="92vw"
      centered
      destroyOnClose
      className={styles.detailModal}
      styles={{ body: { padding: 0, maxHeight: '86vh', display: 'flex', flexDirection: 'column' } }}
      closable={false}
    >
      <TicketDetail
        ticket={detail}
        showMiniMap={false}
        onClose={onClose}
        onTicketUpdate={(updated) => setDetail((prev) => ({ ...prev, ...updated }))}
      />
    </Modal>
  )
}
