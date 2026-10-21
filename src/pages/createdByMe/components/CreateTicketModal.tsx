import { Form, Input, Modal, Select, message } from 'antd'

import { createInitiatedOrder } from '@/api/initiated'
import {
  INITIATED_TARGET_DEPT_OPTIONS,
  INITIATED_URGENCY_OPTIONS,
  getInitiatedTargetDeptLabel,
  getInitiatedUrgencyLabel,
} from '../config'

export function CreateTicketModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [form] = Form.useForm()

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      await createInitiatedOrder({
        ...values,
        targetDept: getInitiatedTargetDeptLabel(values.targetDept) || values.targetDept,
        urgency: (getInitiatedUrgencyLabel(values.urgency) as any) || values.urgency,
      })
      message.success('工单发起成功')
      form.resetFields()
      onSuccess()
      onClose()
    } catch {
      // Form validation error
    }
  }

  return (
    <Modal
      title="新建发起工单"
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="确认发起"
      cancelText="取消"
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ urgency: 'mid' }}>
        <Form.Item
          name="title"
          label="工单标题"
          rules={[{ required: true, message: '请输入工单标题' }]}
        >
          <Input placeholder="例：某某基站光缆巡检协调申请" />
        </Form.Item>

        <Form.Item
          name="targetDept"
          label="派往部门"
          rules={[{ required: true, message: '请选择目标处理部门' }]}
        >
          <Select
            placeholder="请选择目标部门"
            options={INITIATED_TARGET_DEPT_OPTIONS}
          />
        </Form.Item>

        <Form.Item name="urgency" label="紧急度">
          <Select options={INITIATED_URGENCY_OPTIONS} />
        </Form.Item>

        <Form.Item
          name="summary"
          label="工单描述"
          rules={[{ required: true, message: '请输入工单说明' }]}
        >
          <Input.TextArea rows={3} placeholder="请简要说明故障现象或协调诉求..." />
        </Form.Item>
      </Form>
    </Modal>
  )
}
