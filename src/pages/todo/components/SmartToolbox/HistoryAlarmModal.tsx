import { Modal, Table, Tag } from 'antd'

const MOCK_HISTORY = [
  {
    key: '1',
    name: 'Cell Unavailable',
    level: '严重',
    time: '2025-03-20 09:12',
    clearTime: '2025-03-20 11:40',
    site: '丽水南站G502',
  },
  {
    key: '2',
    name: 'Power Failure',
    level: '主要',
    time: '2025-03-15 22:05',
    clearTime: '2025-03-16 01:20',
    site: '丽水南站G502',
  },
  {
    key: '3',
    name: 'High Temperature',
    level: '次要',
    time: '2025-03-08 14:33',
    clearTime: '2025-03-08 16:00',
    site: '丽水南站G502',
  },
]

export function HistoryAlarmModal({
  open,
  ticketId,
  ticketTitle,
  onClose,
}: {
  open: boolean
  ticketId?: string
  ticketTitle?: string
  onClose: () => void
}) {
  return (
    <Modal
      title="历史告警"
      open={open}
      onCancel={onClose}
      footer={null}
      width={760}
      destroyOnClose
    >
      <p style={{ marginBottom: 12, color: '#666', fontSize: 13 }}>
        工单：{ticketTitle || ticketId || '--'} 关联的历史告警记录
      </p>
      <Table
        size="small"
        pagination={false}
        dataSource={MOCK_HISTORY}
        columns={[
          { title: '告警名称', dataIndex: 'name', key: 'name' },
          {
            title: '级别',
            dataIndex: 'level',
            key: 'level',
            width: 90,
            render: (v: string) => (
              <Tag color={v === '严重' ? 'error' : v === '主要' ? 'warning' : 'default'}>{v}</Tag>
            ),
          },
          { title: '发生时间', dataIndex: 'time', key: 'time', width: 150 },
          { title: '清除时间', dataIndex: 'clearTime', key: 'clearTime', width: 150 },
          { title: '站点', dataIndex: 'site', key: 'site' },
        ]}
      />
    </Modal>
  )
}
