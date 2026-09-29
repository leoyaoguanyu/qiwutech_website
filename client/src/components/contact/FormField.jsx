import styles from './FormField.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * 表单字段外壳：label + 控件 + 错误提示。
 * 子元素需自行携带 id，与 label 的 htmlFor 对应。
 */
export default function FormField({ id, label, required = false, error, className, children }) {
  return (
    <div className={cx(styles.group, error && styles.hasError, className)}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
