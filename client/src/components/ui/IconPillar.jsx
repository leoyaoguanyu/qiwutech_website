import styles from './IconPillar.module.css';

/** 圆形浅紫图标 + 标题 + 描述（团队实力 / 未来规划） */
export default function IconPillar({ icon: Icon, title, description }) {
  return (
    <div className={styles.pillar}>
      <div className={styles.icon} aria-hidden="true">
        <Icon />
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </div>
  );
}
