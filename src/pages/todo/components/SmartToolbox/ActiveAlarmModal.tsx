import { BellOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Input, Modal, Select, Table, message } from 'antd'

import { subscribeBufferItem } from '@/api/todo'
import { useMemo, useState } from 'react'

import styles from './SmartToolbox.module.scss'

interface AlarmRow {
  key: string
  status: '紧急' | '重要' | '次要'
  name: string
  target: string
  time: string
  duration: string
  vendor: string
  neName: string
  deviceId: string
}

const MOCK_ALL: AlarmRow[] = [
  {
    key: '1',
    status: '紧急',
    name: '星钟失步告警',
    target: '机柜0-机框1-槽位2',
    time: '2025-03-26 14:22:15',
    duration: '2h 15min',
    vendor: '华为',
    neName: '丽水南站G502',
    deviceId: 'ZJ_LS_BS_0982',
  },
  {
    key: '2',
    status: '重要',
    name: 'S1接口断连告警',
    target: '核心网侧接口',
    time: '2025-03-26 15:10:00',
    duration: '1h 27min',
    vendor: '华为',
    neName: '丽水南站G502',
    deviceId: 'ZJ_LS_BS_0982',
  },
  {
    key: '3',
    status: '次要',
    name: 'RRC Setup Failure',
    target: '小区 LTE-Cell-3',
    time: '2025-03-26 16:05:30',
    duration: '32min',
    vendor: '中兴',
    neName: '中央商务区5G微站',
    deviceId: 'SH_LZ_5G_012',
  },
]

const VENDOR_OPTIONS = [
  { value: '', label: '全部' },
  { value: '华为', label: '华为' },
  { value: '中兴', label: '中兴' },
  { value: '爱立信', label: '爱立信' },
]

const LEVEL_OPTIONS = [
  { value: '', label: '全部' },
  { value: '紧急', label: '紧急' },
  { value: '重要', label: '重要' },
  { value: '次要', label: '次要' },
]

/**
 * 活动告警查询弹窗 —— 对齐原型：筛选区 + 状态/名称/对象/时间/时长/订阅
 */
export function ActiveAlarmModal({
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
  const [neName, setNeName] = useState('')
  const [deviceId, setDeviceId] = useState('')
  const [vendor, setVendor] = useState('')
  const [level, setLevel] = useState('')
  const [query, setQuery] = useState({ neName: '', deviceId: '', vendor: '', level: '' })

  const data = useMemo(() => {
    return MOCK_ALL.filter((row) => {
      if (query.neName && !row.neName.includes(query.neName) && !row.target.includes(query.neName)) {
        return false
      }
      if (query.deviceId && !row.deviceId.includes(query.deviceId)) return false
      if (query.vendor && row.vendor !== query.vendor) return false
      if (query.level && row.status !== query.level) return false
      return true
    })
  }, [query])

  const handleSearch = () => {
    setQuery({ neName: neName.trim(), deviceId: deviceId.trim(), vendor, level })
  }

  return (
    <Modal
      title={
        <span className={styles.alarmTitle}>
          <BellOutlined style={{ color: '#214ae2', marginRight: 8 }} />
          活动告警查询
        </span>
      }
      open={open}
      onCancel={onClose}
      width={900}
      destroyOnClose
      footer={
        <Button onClick={onClose} className={styles.alarmCloseBtn}>
          关闭
        </Button>
      }
      styles={{ body: { paddingTop: 12 } }}
    >
      {(ticketTitle || ticketId) && (
        <p className={styles.alarmHint}>关联工单：{ticketTitle || ticketId}</p>
      )}

      <div className={styles.alarmFilter}>
        <div className={styles.alarmFilterGrid}>
          <div className={styles.alarmField}>
            <label>网元名称</label>
            <Input
              placeholder="请输入网元名称"
              value={neName}
              onChange={(e) => setNeName(e.target.value)}
              allowClear
            />
          </div>
          <div className={styles.alarmField}>
            <label>设备ID</label>
            <Input
              placeholder="请输入设备ID"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              allowClear
            />
          </div>
          <div className={styles.alarmField}>
            <label>厂商</label>
            <Select
              value={vendor}
              onChange={setVendor}
              options={VENDOR_OPTIONS}
              style={{ width: '100%' }}
            />
          </div>
          <div className={styles.alarmField}>
            <label>告警级别</label>
            <Select
              value={level}
              onChange={setLevel}
              options={LEVEL_OPTIONS}
              style={{ width: '100%' }}
            />
          </div>
        </div>
        <Button type="primary" onClick={handleSearch} className={styles.alarmSearchBtn}>
          开始查询
        </Button>
      </div>

      <Table
        size="middle"
        pagination={false}
        dataSource={data}
        className={styles.alarmTable}
        columns={[
          {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 90,
            render: (v: AlarmRow['status']) => {
              const cls =
                v === '紧急'
                  ? styles.statusCritical
                  : v === '重要'
                    ? styles.statusMajor
                    : styles.statusMinor
              return (
                <span className={cls}>
                  <i className={styles.statusDot} />
                  {v}
                </span>
              )
            },
          },
          { title: '告警名称', dataIndex: 'name', key: 'name' },
          { title: '告警对象', dataIndex: 'target', key: 'target' },
          { title: '发生时间', dataIndex: 'time', key: 'time', width: 160 },
          { title: '持续时长', dataIndex: 'duration', key: 'duration', width: 100 },
          {
            title: '操作',
            key: 'action',
            width: 90,
            render: (_: unknown, record: (typeof MOCK_ALL)[number]) => (
              <Button
                type="link"
                size="small"
                icon={<PlusOutlined />}
                onClick={async () => {
                  if (!ticketId) {
                    message.warning('请先选择工单后再订阅')
                    return
                  }
                  try {
                    await subscribeBufferItem({
                      ticketId,
                      category: 'alarm',
                      tag: '活动告警',
                      title: `${record.name} - ${record.target}`,
                      meta: `发生: ${record.time} | 持续: ${record.duration} | 级别: ${record.status}`,
                    })
                    message.success('已订阅至工单订阅缓冲区')
                  } catch {
                    message.error('订阅失败，请稍后重试')
                  }
                }}
              >
                订阅
              </Button>
            ),
          },
        ]}
      />
    </Modal>
  )
}
