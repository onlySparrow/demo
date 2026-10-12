import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined, UserSwitchOutlined, MessageOutlined } from '@ant-design/icons'
import { Button, Card, Descriptions, Divider, Space, Tag, Timeline, message } from 'antd'
import { useNavigate } from 'react-router'

export interface TodoDetailHostProps {
  platform: 'pc' | 'mobile'
  sourceKey: string
  todoId: string
}

export function TodoDetailHost({ sourceKey, todoId }: TodoDetailHostProps) {
  const navigate = useNavigate()

  const handleAction = (actionName: string) => {
    message.success(`工单 ${todoId} 操作成功: ${actionName}`)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              返回列表
            </Button>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>工单详情 - {todoId || 'TODO-DEMO'}</h2>
            {sourceKey && <Tag color="blue">{decodeURIComponent(sourceKey)}</Tag>}
            <Tag color="orange">处理中</Tag>
          </Space>
          <Space>
            <Button icon={<MessageOutlined />} onClick={() => handleAction('催办/沟通')}>
              催办
            </Button>
            <Button icon={<UserSwitchOutlined />} onClick={() => handleAction('转派')}>
              转派
            </Button>
            <Button danger icon={<CloseCircleOutlined />} onClick={() => handleAction('驳回')}>
              驳回
            </Button>
            <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleAction('同意通过')}>
              同意通过
            </Button>
          </Space>
        </div>

        <Card title="工单基本信息" style={{ marginBottom: 16 }}>
          <Descriptions bordered column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
            <Descriptions.Item label="工单编号">{todoId || 'TODO-001'}</Descriptions.Item>
            <Descriptions.Item label="来源系统">{decodeURIComponent(sourceKey) || '网络运营监控室'}</Descriptions.Item>
            <Descriptions.Item label="优先级">
              <Tag color="red">高</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">2025-03-26 17:36</Descriptions.Item>
            <Descriptions.Item label="申请人">张三 (网络运维组)</Descriptions.Item>
            <Descriptions.Item label="所属区域">华东骨干中心 / 丽水枢纽</Descriptions.Item>
            <Descriptions.Item label="业务类型">核心故障排查与恢复</Descriptions.Item>
            <Descriptions.Item label="时限要求">2小时内响应</Descriptions.Item>
            <Descriptions.Item label="工单概述" span={3}>
              【高铁督办工单】[衍生关联] LTE小区退出服务，涉及重要节点通信保障，请各运维协同岗位立即按预案执行应急倒换并排查光缆及基站电源。
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="流程流转历史与操作记录">
          <Timeline
            items={[
              {
                color: 'green',
                children: (
                  <div>
                    <div style={{ fontWeight: 500 }}>系统自动生成工单并派发</div>
                    <div style={{ color: '#888', fontSize: 12 }}>2025-03-26 17:36:12 · 网络告警监控平台</div>
                  </div>
                ),
              },
              {
                color: 'blue',
                children: (
                  <div>
                    <div style={{ fontWeight: 500 }}>张三 接收工单并提交预处理排查报告</div>
                    <div style={{ color: '#888', fontSize: 12 }}>2025-03-26 17:45:00 · 运维专员</div>
                  </div>
                ),
              },
              {
                color: 'gray',
                children: (
                  <div>
                    <div style={{ fontWeight: 500 }}>待当前处理人协同审批与确认处理结果</div>
                    <div style={{ color: '#888', fontSize: 12 }}>等待当前节点完成</div>
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </div>
  )
}
