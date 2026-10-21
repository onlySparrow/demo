import { UserOutlined } from '@ant-design/icons'
import { Button, Input, Modal, Select, message } from 'antd'
import { useEffect, useState } from 'react'

import { transferTodo, fetchTransferAssignees, fetchTransferQuickReplies, type TransferAssignee, type TransferQuickReply } from '@/api/todo'

import type { TodoTicket } from './TodoTicketCard'

import styles from './ActionModals.module.scss'

interface TransferModalProps {
  open: boolean
  ticketId: string
  onClose: () => void
  /** 转派成功回调 —— 携带流转信息已更新的工单,由外层同步列表/详情 */
  onSuccess?: (ticket: TodoTicket) => void
}

/**
 * 转派弹窗 —— 对齐原型图：
 * 转派说明 + 高频快捷回复（接口） + 转派对象（接口） + 取消/提交
 */
export function TransferModal({ open, ticketId, onClose, onSuccess }: TransferModalProps) {
  const [remark, setRemark] = useState('')
  const [assigneeId, setAssigneeId] = useState<string | undefined>()
  const [quickReplies, setQuickReplies] = useState<TransferQuickReply[]>([])
  const [assignees, setAssignees] = useState<TransferAssignee[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setRemark('')
    setAssigneeId(undefined)
    setLoading(true)
    Promise.all([fetchTransferQuickReplies(), fetchTransferAssignees()])
      .then(([replies, people]) => {
        setQuickReplies(replies)
        setAssignees(people)
      })
      .catch((err) => {
        console.error('[todo] 加载转派数据失败:', err)
        message.error('加载转派数据失败')
      })
      .finally(() => setLoading(false))
  }, [open])

  const handleQuickReply = (content: string) => {
    setRemark((prev) => (prev ? `${prev}\n${content}` : content))
  }

  const handleSubmit = async () => {
    if (!assigneeId) {
      message.warning('请选择转派对象')
      return
    }
    setSubmitting(true)
    try {
      const updated = await transferTodo({ ticketId, assigneeId, remark })
      message.success(`已转派给 ${updated.assignee}，流转信息已更新`)
      onSuccess?.(updated)
      onClose()
    } catch (error) {
      console.error('[todo] 转派失败:', error)
      message.error('转派失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={440}
      className={styles.actionModal}
      destroyOnClose
      styles={{ body: { padding: 0 } }}
    >
      <header className={styles.modalHeader}>
        <h3>转派</h3>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="关闭">
          ×
        </button>
      </header>

      <div className={styles.modalBody}>
        <div className={styles.formRow}>
          <label className={styles.label}>转派说明</label>
          <div className={styles.fieldCol}>
            <Input.TextArea
              rows={5}
              placeholder="请输入转派说明"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className={styles.textarea}
            />
            <div className={styles.quickReplies}>
              <p className={styles.quickTitle}>高频快捷回复</p>
              <div className={styles.quickChips}>
                {quickReplies.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={styles.quickChip}
                    onClick={() => handleQuickReply(item.content)}
                  >
                    {item.content}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.formRowAlign}>
          <label className={styles.label}>
            <span className={styles.required}>*</span> 转派对象
          </label>
          <Select
            showSearch
            allowClear
            placeholder="请选择转派人"
            value={assigneeId}
            onChange={setAssigneeId}
            loading={loading}
            className={styles.assigneeSelect}
            suffixIcon={<UserOutlined />}
            optionFilterProp="label"
            options={assignees.map((a) => ({
              value: a.id,
              label: a.dept ? `${a.name}（${a.dept}）` : a.name,
            }))}
          />
        </div>
      </div>

      <footer className={styles.modalFooter}>
        <Button className={styles.cancelBtn} onClick={onClose}>
          取消
        </Button>
        <Button type="primary" className={styles.submitBtn} loading={submitting} onClick={handleSubmit}>
          提交
        </Button>
      </footer>
    </Modal>
  )
}
