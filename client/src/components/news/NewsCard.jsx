import { formatNewsDate } from '../../data/news.js';
import styles from './NewsCard.module.css';

/** 新闻中心卡片：图片 + 标题 + 摘要 + 日期，整卡可点击跳转公众号文章 */
export default function NewsCard({ title, summary, url, date, image, alt, index = 0 }) {
  return (
    <article className={`${styles.card} fade-in-up`} style={{ animationDelay: `${Math.min(index, 5) * 0.1}s` }}>
      <a href={url} target="_blank" rel="noopener noreferrer" className={styles.link}>
        <div className={styles.imageWrap}>
          <img src={image} alt={alt || title} className={styles.image} loading="lazy" />
        </div>
        <div className={styles.content}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.summary}>{summary}</p>
          <time className={styles.date} dateTime={date}>
            {formatNewsDate(date)}
          </time>
        </div>
      </a>
    </article>
  );
}
