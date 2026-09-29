import { Link } from 'react-router-dom';
import styles from './Button.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * 通用按钮。根据传入的 to / href 自动渲染为路由链接 / 外链 / button。
 * @param {'primary'|'white'|'outlineLight'|'ghostLight'} variant
 * @param {boolean} pill 胶囊形（联系表单提交按钮）
 */
export default function Button({
  to,
  href,
  variant = 'primary',
  pill = false,
  icon,
  iconPosition = 'right',
  className,
  children,
  ...rest
}) {
  const classes = cx(styles.btn, styles[variant], pill && styles.pill, className);
  const content = (
    <>
      {icon && iconPosition === 'left' && <span className={styles.icon}>{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className={styles.icon}>{icon}</span>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...rest}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" className={classes} {...rest}>
      {content}
    </button>
  );
}
