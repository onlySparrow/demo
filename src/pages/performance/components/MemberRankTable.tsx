import { DownloadOutlined } from '@ant-design/icons'
import { Button, Input, Table, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useState } from 'react'

import {
  exportPerformanceReport,
  type ExportPerformanceParams,
  type MemberPerformance,
} from '@/api/performance'

/** 排名前三的展示色(对齐设计图:1 红 / 2 橙 / 3 棕) */
const RANK_COLORS = ['#ba1a1a', '#d46b08', '#6d4c41']

/**
 * 成员效能排行 —— 排名/成员/完成量/完成率/平均时长/超时率;
 * 表格设最大高度(数据多时表头固定只滚内容),支持搜索与导出报表(服务端 xlsx)。
 */
export function MemberRankTable({
  members,
  exportParams,
}: {
  members: MemberPerformance[]
  /** 导出所用的筛选条件(时间维度/视图/数据范围),由页面透传 */
  exportParams: ExportPerformanceParams
}) {
  const [search, setSearch] = useState('')
  const [exporting, setExporting] = useState(false)

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  )

  /** 导出报表:服务端生成 xlsx 文件流,前端触发下载 */
  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await exportPerformanceReport(exportParams)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = '成员效能排行.xlsx'
      link.click()
      URL.revokeObjectURL(url)
      message.success('报表已导出')
    } catch (error) {
      console.error('[performance] 导出报表失败:', error)
      message.error('导出失败，请稍后重试')
    } finally {
      setExporting(false)
    }
  }

  const columns: ColumnsType<MemberPerformance> = [
    {
      title: '排名',
      key: 'rank',
      width: 80,
      render: (_, __, index) => (
        <span
          style={{
            color: index < 3 ? RANK_COLORS[index] : '#999',
            fontWeight: index < 3 ? 700 : 400,
          }}
        >
          {index + 1}
        </span>
      ),
    },
    {
      title: '成员',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => {
        const isSelf = name.includes('你')
        return (
          <span style={{ fontWeight: isSelf ? 700 : 500, color: isSelf ? '#005daa' : '#333' }}>
            {name}
          </span>
        )
      },
    },
    {
      title: '完成量',
      dataIndex: 'completed',
      key: 'completed',
      sorter: (a, b) => a.completed - b.completed,
      render: (val: number) => <span style={{ fontFamily: 'monospace' }}>{val}</span>,
    },
    {
      title: '完成率',
      dataIndex: 'rate',
      key: 'rate',
      sorter: (a, b) => a.rate - b.rate,
      render: (val: number) => <span style={{ fontFamily: 'monospace' }}>{val}%</span>,
    },
    {
      title: '平均时长',
      dataIndex: 'avgTime',
      key: 'avgTime',
      sorter: (a, b) => a.avgTime - b.avgTime,
      render: (val: number) => <span style={{ fontFamily: 'monospace' }}>{val}分钟</span>,
    },
    {
      title: '超时率',
      dataIndex: 'overtime',
      key: 'overtime',
      sorter: (a, b) => a.overtime - b.overtime,
      render: (val: number) => (
        <span
          style={{
            fontFamily: 'monospace',
            color: val > 10 ? '#ba1a1a' : '#2e7d32',
            fontWeight: val > 10 ? 600 : 400,
          }}
        >
          {val}%
        </span>
      ),
    },
  ]

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 8,
        border: '1px solid #c0c7d6',
        padding: '14px 16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
          gap: 8,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>成员效能排行</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Input
            size="small"
            placeholder="搜索成员..."
            style={{ width: 180 }}
            allowClear
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            type="primary"
            size="middle"
            icon={<DownloadOutlined />}
            loading={exporting}
            onClick={handleExport}
          >
            导出报表
          </Button>
        </div>
      </div>

      {/* 最大高度滚动:数据多时表头固定,只滚动内容区(antd scroll.y 自带 sticky 表头) */}
      <Table<MemberPerformance>
        size="small"
        columns={columns}
        dataSource={filtered}
        rowKey={(record) => record.name}
        pagination={false}
        scroll={{ y: 420 }}
        sticky
      />
    </div>
  )
}
