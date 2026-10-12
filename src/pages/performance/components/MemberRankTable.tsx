import { Input, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useState } from 'react'

import type { MemberPerformance } from '../../../api/performanceMock'

export function MemberRankTable({
  members,
  onSelectMember,
  selectedMemberName,
}: {
  members: MemberPerformance[]
  onSelectMember?: (member: MemberPerformance) => void
  selectedMemberName?: string
}) {
  const [search, setSearch] = useState('')

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  )

  const columns: ColumnsType<MemberPerformance> = [
    {
      title: '排名',
      key: 'rank',
      width: 70,
      render: (_, __, index) => {
        if (index === 0) return <span style={{ color: '#d48806', fontWeight: 700 }}>🥇 1</span>
        if (index === 1) return <span style={{ color: '#8c8c8c', fontWeight: 700 }}>🥈 2</span>
        if (index === 2) return <span style={{ color: '#d46b08', fontWeight: 700 }}>🥉 3</span>
        return <span style={{ color: '#999' }}>{index + 1}</span>
      },
    },
    {
      title: '成员姓名',
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
      render: (val: number) => <span style={{ fontFamily: 'monospace' }}>{val} 单</span>,
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
      render: (val: number) => <span style={{ fontFamily: 'monospace' }}>{val} min</span>,
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
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>团队效能排名榜</span>
        <Input.Search
          size="small"
          placeholder="搜索成员姓名"
          style={{ width: 180 }}
          allowClear
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table<MemberPerformance>
        size="small"
        columns={columns}
        dataSource={filtered}
        rowKey={(record) => record.name}
        pagination={false}
        onRow={(record) => ({
          onClick: () => onSelectMember?.(record),
          style: {
            cursor: 'pointer',
            backgroundColor:
              record.name === selectedMemberName ? 'rgba(0, 93, 170, 0.06)' : undefined,
          },
        })}
      />
    </div>
  )
}
