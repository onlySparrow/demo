import { CheckCircleOutlined, PaperClipOutlined } from '@ant-design/icons'
import { Tag } from 'antd'

import type { NoticeItem } from '@/api/notice'

import styles from './ReadNoticeCard.module.scss'

export function ReadNoticeCard({ notice }: { notice: NoticeItem }) {
  return (
    <div className={styles.card}>
      <div className={styles.titleRow}>
        <span className={styles.title} title={notice.title}>
          {notice.title}
        </span>
        <Tag icon={<CheckCircleOutlined />} color="success" style={{ margin: 0, fontSize: 10 }}>
          已阅
        </Tag>
      </div>

      <div className={styles.metaRow}>
        <Tag style={{ margin: 0, fontSize: 10 }}>{notice.category}</Tag>
        <span>{notice.department}</span>
        <span className={styles.dot}>·</span>
        <span>发布: {notice.publishTime}</span>
      </div>

      {notice.summary && (
        <div className={styles.summary} title={notice.summary}>
          {notice.summary}
        </div>
      )}

      <div className={styles.footer}>
        <div>
          {notice.attachments && notice.attachments.length > 0 && (
            <span>
              <PaperClipOutlined style={{ marginRight: 4 }} />
              {notice.attachments.length} 个附件
            </span>
          )}
        </div>
        {notice.readTime && <span>查阅于 {notice.readTime}</span>}
      </div>
    </div>
  )
}
