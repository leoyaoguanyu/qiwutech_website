import styles from './HeroBanner.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * 全屏背景图横幅（首页 / O1 产品页第一屏）
 * @param {'dark'|'light'} tone dark: 深色遮罩 + 白色渐变标题；light: 浅色背景 + 深色文字
 * @param {'left'|'right'} align 文案在容器内的位置
 */
export default function HeroBanner({
  image,
  imagePosition = 'center',
  title,
  subtitle,
  tone = 'dark',
  align = 'right',
  overlay = tone === 'dark',
  children,
}) {
  return (
    <section className={cx(styles.hero, styles[tone], styles[align])}>
      <div
        className={styles.background}
        style={{ backgroundImage: `url(${image})`, backgroundPosition: imagePosition }}
        role="img"
        aria-label={title}
      />
      {overlay && <div className={styles.overlay} aria-hidden="true" />}
      <div className={`container ${styles.container}`}>
        <div className={styles.content}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          {children && <div className={styles.actions}>{children}</div>}
        </div>
      </div>
    </section>
  );
}
