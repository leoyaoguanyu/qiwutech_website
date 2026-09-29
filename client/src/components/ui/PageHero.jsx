import styles from './PageHero.module.css';

/** 内页黑色头图：渐变标题 + 副标题（新闻中心 / 联系我们 / 技术） */
export default function PageHero({ title, subtitle, children }) {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.inner}`}>
        <h1 className={`${styles.title} gradient-text`}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
