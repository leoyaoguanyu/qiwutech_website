import styles from './StatItem.module.css';

export default function StatItem({ value, label }) {
  return (
    <div className={styles.stat}>
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
    </div>
  );
}
