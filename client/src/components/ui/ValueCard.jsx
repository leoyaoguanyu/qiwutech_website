import styles from './ValueCard.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * 使命 / 愿景卡片
 * @param {'filled'|'plain'} variant filled: 紫色渐变底；plain: 白底
 */
export default function ValueCard({ icon: Icon, pointIcon: PointIcon, title, description, points = [], variant = 'plain' }) {
  return (
    <article className={cx(styles.card, styles[variant])}>
      <div className={styles.icon} aria-hidden="true">
        <Icon />
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {points.length > 0 && (
        <ul className={styles.points}>
          {points.map((point) => (
            <li key={point}>
              {PointIcon && <PointIcon aria-hidden="true" />}
              <span>{point}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
