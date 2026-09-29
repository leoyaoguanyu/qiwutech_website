import { FaCircle } from 'react-icons/fa';
import styles from './InnovationItem.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * 图文左右排列的技术创新条目
 * @param {boolean} reverse 图在右、文字在左
 * @param {'brain'|'circuit'} visualTheme 左侧色块配色
 */
export default function InnovationItem({
  icon: Icon,
  visualIcon: VisualIcon,
  visualTheme = 'brain',
  title,
  description,
  features = [],
  reverse = false,
}) {
  return (
    <div className={cx(styles.item, reverse && styles.reverse)}>
      <div className={styles.visual}>
        <div className={cx(styles.visualBox, styles[visualTheme])} aria-hidden="true">
          {VisualIcon && <VisualIcon />}
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.icon} aria-hidden="true">
          <Icon />
        </div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        {features.length > 0 && (
          <ul className={styles.features}>
            {features.map((feature) => (
              <li key={feature}>
                <FaCircle aria-hidden="true" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
