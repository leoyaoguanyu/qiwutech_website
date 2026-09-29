import styles from './SectionHeader.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * 区块标题：标题 + 可选紫色下划线 + 可选副标题
 * @param {boolean} light 深色背景上使用（渐变标题、浅色副标题）
 * @param {'h2'|'h3'} as
 */
export default function SectionHeader({ title, subtitle, underline = false, light = false, as: Tag = 'h2', className }) {
  return (
    <div className={cx(styles.header, light && styles.light, className)}>
      <Tag className={cx(styles.title, light && 'gradient-text')}>{title}</Tag>
      {underline && <span className={styles.underline} aria-hidden="true" />}
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
}
