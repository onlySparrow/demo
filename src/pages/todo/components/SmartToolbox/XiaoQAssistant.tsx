import { SendOutlined } from '@ant-design/icons'
import { Button, Input } from 'antd'
import { useEffect, useRef, useState } from 'react'

import {
  PersonIcon,
  SmartToyFillIcon,
} from '@/assets/icons'

import styles from './SmartToolbox.module.scss'

const SUGGESTS = ['查看当前进度', '查询同站告警']

interface Msg {
  role: 'bot' | 'user'
  text: string
}

/**
 * 小Q智能助手 —— 贴在工具箱左侧的浮层面板（非居中 Modal）
 */
export function XiaoQAssistant({
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
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Msg[]>([])
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    setMessages([{ role: 'bot', text: '你好！我是小Q，有什么我可以帮您的？' }])
    setInput('')
  }, [open])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  if (!open) return null

  const ask = (text: string) => {
    const q = text.trim()
    if (!q) return
    setMessages((prev) => [...prev, { role: 'user', text: q }])
    setInput('')
    setTimeout(() => {
      const siteHint = ticketTitle || ticketId || '当前工单'
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: `丽水南站基站（ZJ_LS_BS_0982）在过去3个月内共有4次告警记录，其中3次为断电告警，1次为退服。建议检查电源模块稳定性。\n（关联：${siteHint}）`,
        },
      ])
    }, 400)
  }

  return (
    <div className={styles.xiaoQPanel} role="dialog" aria-label="小Q智能助手">
      <header className={styles.xiaoQHeader}>
        <span className={styles.xiaoQHeaderTitle}>
          <SmartToyFillIcon className={styles.xiaoQHeaderIcon} />
          小Q智能助手
        </span>
        <button type="button" className={styles.xiaoQClose} onClick={onClose} aria-label="关闭">
          ×
        </button>
      </header>

      <div className={styles.xiaoQChat} ref={listRef}>
        {messages.map((m, i) =>
          m.role === 'bot' ? (
            <div key={i} className={styles.xiaoQRowBot}>
              <div className={styles.xiaoQAvatar}>
                <SmartToyFillIcon />
              </div>
              <div className={styles.xiaoQBubbleBot}>{m.text}</div>
            </div>
          ) : (
            <div key={i} className={styles.xiaoQRowUser}>
              <div className={styles.xiaoQBubbleUser}>{m.text}</div>
              <div className={styles.xiaoQUserAvatar}>
                <PersonIcon />
              </div>
            </div>
          ),
        )}
      </div>

      <div className={styles.xiaoQFooter}>
        <div className={styles.xiaoQSuggests}>
          {SUGGESTS.map((s) => (
            <Button key={s} size="small" shape="round" onClick={() => ask(s)}>
              {s}
            </Button>
          ))}
        </div>
        <div className={styles.xiaoQInputBar}>
          <Input
            placeholder="输入您的问题..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={() => ask(input)}
            variant="borderless"
          />
          <button
            type="button"
            className={styles.xiaoQSend}
            onClick={() => ask(input)}
            aria-label="发送"
          >
            <SendOutlined />
          </button>
        </div>
      </div>
    </div>
  )
}
