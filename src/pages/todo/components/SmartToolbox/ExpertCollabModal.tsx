import { SendOutlined } from '@ant-design/icons'
import { Input, Modal, Tag } from 'antd'
import { useEffect, useRef, useState } from 'react'

import styles from './SmartToolbox.module.scss'

const MEMBERS = [
  { name: '张伟', role: '提单人', initial: '张', color: '#e8f0fe' },
  { name: '李工', role: '高级工程师', initial: '李', color: '#e8f0fe' },
  { name: '王方', role: '站点负责人', initial: '王', color: '#f0f0f0' },
]

interface ChatMsg {
  role: 'system' | 'self' | 'other'
  name?: string
  initial?: string
  text: string
}

/**
 * 专家协同 —— 多人即时通信群组（对齐原型）
 */
export function ExpertCollabModal({
  open,
  ticketId,
  ticketTitle,
  ticketNo,
  siteName,
  onClose,
}: {
  open: boolean
  ticketId?: string
  ticketTitle?: string
  ticketNo?: string
  siteName?: string
  onClose: () => void
}) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    setMessages([
      { role: 'system', text: '已为您一键拉起协同群组，相关专家已就位。' },
      {
        role: 'self',
        name: '张伟',
        initial: '张',
        text: '@李工，当前光路损耗异常，能帮忙看下该站点的历史健康度吗？',
      },
      {
        role: 'other',
        name: '李工',
        initial: '李',
        text: '正在调取该站近三个月的巡检记录，稍等。',
      },
    ])
    setInput('')
  }, [open])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  const send = () => {
    const text = input.trim()
    if (!text) return
    setMessages((prev) => [
      ...prev,
      { role: 'self', name: '张伟', initial: '张', text },
    ])
    setInput('')
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'other',
          name: '李工',
          initial: '李',
          text: '（演示）已收到，正在结合工单上下文分析…',
        },
      ])
    }, 500)
  }

  return (
    <Modal
      title={
        <div>
          <div className={styles.expertTitle}>专家协同</div>
          <div className={styles.expertSub}>多人即时通信群组</div>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={560}
      destroyOnClose
      styles={{ body: { paddingTop: 8 } }}
    >
      <div className={styles.expertTicketCard}>
        <div className={styles.expertTicketTop}>
          <span className={styles.expertTicketNo}>
            工单编号：{ticketNo || ticketId || 'WO-20250326-0042'}
          </span>
          <Tag color="error">通信中断</Tag>
        </div>
        <div className={styles.expertTicketName}>
          {siteName || ticketTitle || '丽水南站G502'}
        </div>
        <div className={styles.expertTicketMeta}>
          <span>告警阈值: -110dBm</span>
          <span className={styles.expertTicketStatus}>当前状态: 通信中断</span>
        </div>
      </div>

      <div className={styles.expertMembers}>
        {MEMBERS.map((m) => (
          <div key={m.name} className={styles.expertCard}>
            <div className={styles.expertAvatar} style={{ background: m.color }}>
              {m.initial}
            </div>
            <div>
              <div className={styles.expertName}>{m.name}</div>
              <div className={styles.expertRole}>{m.role}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.expertChat} ref={listRef}>
        {messages.map((m, i) => {
          if (m.role === 'system') {
            return (
              <div key={i} className={styles.expertSystem}>
                {m.text}
              </div>
            )
          }
          if (m.role === 'self') {
            return (
              <div key={i} className={styles.expertMsgSelf}>
                <div className={styles.expertBubbleSelf}>{m.text}</div>
                <div className={styles.expertAvatarSm}>{m.initial}</div>
              </div>
            )
          }
          return (
            <div key={i} className={styles.expertMsgOther}>
              <div className={styles.expertAvatarSm}>{m.initial}</div>
              <div className={styles.expertBubbleOther}>{m.text}</div>
            </div>
          )
        })}
      </div>

      <div className={styles.expertInputBar}>
        <Input
          placeholder="发送消息..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={send}
          variant="borderless"
          className={styles.expertInput}
        />
        <button type="button" className={styles.expertSend} onClick={send} aria-label="发送">
          <SendOutlined />
        </button>
      </div>
    </Modal>
  )
}
