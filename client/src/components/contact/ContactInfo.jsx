import styles from './ContactInfo.module.css';

/** 联系方式列表（地址 / 邮箱 / 工作时间） */
export default function ContactInfo({ items }) {
  return (
    <address className={styles.list}>
      {items.map(({ id, icon: Icon, title, value, href }) => (
        <div key={id} className={styles.item}>
          <Icon className={styles.icon} aria-hidden="true" />
          <div>
            <h4 className={styles.title}>{title}</h4>
            <p className={styles.value}>{href ? <a href={href}>{value}</a> : value}</p>
          </div>
        </div>
      ))}
    </address>
  );
}
