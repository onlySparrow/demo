import { PaperClipOutlined } from '@ant-design/icons'
import { Button, Tag } from 'antd'
import type { ReactNode } from 'react'

import type { NoticeItem } from '@/api/notice'

import styles from './UnreadNoticeCard.module.scss'

export function UnreadNoticeCard({
  notice,
  checkbox,
  onMarkRead,
}: {
  notice: NoticeItem
  checkbox?: ReactNode
  onMarkRead?: (id: string) => void
}) {
  const getUrgencyColor = (urgency: NoticeItem['urgency']) => {
    switch (urgency) {
      case '紧急':
        return 'error'
      case '重要':
        return 'warning'
      default:
        return 'processing'
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.titleRow}>
        {checkbox}
        <span className={styles.title} title={notice.title}>
          {notice.title}
        </span>
        <Tag color={getUrgencyColor(notice.urgency)} style={{ margin: 0, fontSize: 10 }}>
          {notice.urgency}
        </Tag>
      </div>

      <div className={styles.metaRow}>
        <Tag style={{ margin: 0, fontSize: 10 }}>{notice.category}</Tag>
        <span>{notice.department}</span>
        <span className={styles.dot}>·</span>
        <span>{notice.publishTime}</span>
      </div>

      {notice.summary && (
        <div className={styles.summary} title={notice.summary}>
          {notice.summary}
        </div>
      )}

      <div className={styles.footer}>
        <div>
          {notice.attachments && notice.attachments.length > 0 && (
            <span style={{ fontSize: 11, color: '#888' }}>
              <PaperClipOutlined style={{ marginRight: 4 }} />
              {notice.attachments.length} 个附件
            </span>
          )}
        </div>
        <Button
          size="small"
          type="link"
          onClick={(e) => {
            e.stopPropagation()
            onMarkRead?.(notice.id)
          }}
          style={{ padding: 0 }}
        >
          标为已阅
        </Button>
      </div>
    </div>
  )
}
