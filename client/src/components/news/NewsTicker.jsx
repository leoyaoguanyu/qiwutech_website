import styles from './NewsTicker.module.css';

/**
 * 首页横向无缝滚动的新闻卡片。
 * 列表复制一份拼接，配合 translateX(-50%) 动画实现无缝循环；复制的那份对读屏器隐藏。
 */
export default function NewsTicker({ items, speed = 30 }) {
  const doubled = [...items, ...items];

  return (
    <div className={styles.viewport}>
      <ul className={styles.track} style={{ animationDuration: `${speed}s` }}>
        {doubled.map((item, index) => (
          <li key={`${item.id}-${index}`} className={styles.card} aria-hidden={index >= items.length || undefined}>
            <h3 className={styles.title}>{item.title}</h3>
            <p className={styles.summary}>{item.summary}</p>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
              tabIndex={index >= items.length ? -1 : 0}
            >
              阅读 &gt;&gt;
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
