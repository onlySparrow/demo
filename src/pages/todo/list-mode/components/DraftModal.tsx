import { Button, DatePicker, Input, Modal, message } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'

import styles from './ActionModals.module.scss'

interface DraftModalProps {
  open: boolean
  ticketId: string
  /** 默认反馈人展示名 */
  feedbackPerson?: string
  /** 一键回填预填内容 */
  initialContent?: string
  onClose: () => void
}

/**
 * 暂存弹窗 —— 对齐原型图：
 * 反馈人 / 反馈时间 / 反馈内容 + 重置 / 提交
 */
export function DraftModal({
  open,
  ticketId,
  feedbackPerson = '张工',
  initialContent = '',
  onClose,
}: DraftModalProps) {
  const [content, setContent] = useState('')
  const [feedbackTime, setFeedbackTime] = useState<Dayjs>(dayjs())
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setContent(initialContent || '')
    setFeedbackTime(dayjs())
  }, [open, initialContent])

  const handleReset = () => {
    setContent(initialContent || '')
    setFeedbackTime(dayjs())
  }

  const handleSubmit = () => {
    if (!content.trim()) {
      message.warning('请输入反馈内容')
      return
    }
    setSubmitting(true)
    console.warn('[todo] 暂存提交:', {
      ticketId,
      person: feedbackPerson,
      time: feedbackTime.format('YYYY-MM-DD HH:mm'),
      content,
    })
    setTimeout(() => {
      setSubmitting(false)
      message.success('暂存成功（演示）')
      onClose()
    }, 200)
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={450}
      className={styles.actionModal}
      destroyOnClose
      styles={{ body: { padding: 0 } }}
    >
      <header className={styles.modalHeader}>
        <h3>暂存</h3>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="关闭">
          ×
        </button>
      </header>

      <div className={styles.modalBody}>
        <div className={styles.formRowAlign}>
          <label className={styles.labelWide}>
            <span className={styles.required}>*</span> 反馈人
          </label>
          <div className={styles.plainValue}>{feedbackPerson}</div>
        </div>

        <div className={styles.formRowAlign}>
          <label className={styles.labelWide}>
            <span className={styles.required}>*</span> 反馈时间
          </label>
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            value={feedbackTime}
            onChange={(v) => v && setFeedbackTime(v)}
            className={styles.timeInput}
            allowClear={false}
          />
        </div>

        <div className={styles.formRow}>
          <label className={styles.labelWide}>
            <span className={styles.required}>*</span> 反馈内容
          </label>
          <Input.TextArea
            rows={5}
            placeholder="请输入暂存内容..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={styles.textarea}
          />
        </div>
      </div>

      <footer className={styles.modalFooter}>
        <Button className={styles.cancelBtn} onClick={handleReset}>
          重置
        </Button>
        <Button type="primary" className={styles.submitBtn} loading={submitting} onClick={handleSubmit}>
          提交
        </Button>
      </footer>
    </Modal>
  )
}
