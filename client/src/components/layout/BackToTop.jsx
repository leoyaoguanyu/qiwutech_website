import { FaArrowUp } from 'react-icons/fa';
import useScrolled from '../../hooks/useScrolled.js';
import styles from './BackToTop.module.css';

export default function BackToTop() {
  const visible = useScrolled(300);

  return (
    <button
      type="button"
      className={`${styles.button} ${visible ? styles.visible : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="返回顶部"
      tabIndex={visible ? 0 : -1}
    >
      <FaArrowUp />
    </button>
  );
}
