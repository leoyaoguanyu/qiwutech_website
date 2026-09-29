import styles from './SpecItem.module.css';

/** 产品规格：圆形图标 + 数值 + 说明 */
export default function SpecItem({ icon: Icon, value, label }) {
  return (
    <div className={styles.spec}>
      <div className={styles.icon} aria-hidden="true">
        <Icon />
      </div>
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
    </div>
  );
}
