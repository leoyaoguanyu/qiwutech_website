import styles from './FeatureCard.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * 白色特性卡片：渐变图标 + 标题 + 描述 (+ 关键词标签)
 * @param {'center'|'left'} variant center: 首页特性；left: 技术优势（带关键词）
 */
export default function FeatureCard({ icon: Icon, title, description, keywords, variant = 'center' }) {
  return (
    <article className={cx(styles.card, styles[variant])}>
      <div className={styles.icon} aria-hidden="true">
        <Icon />
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {keywords?.length > 0 && (
        <ul className={styles.keywords}>
          {keywords.map((keyword) => (
            <li key={keyword} className={styles.keyword}>
              {keyword}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
