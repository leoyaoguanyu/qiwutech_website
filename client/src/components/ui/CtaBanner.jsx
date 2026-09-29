import Button from './Button.jsx';
import styles from './CtaBanner.module.css';

/** 紫色渐变行动号召横幅 */
export default function CtaBanner({ title, description, primary, secondary }) {
  return (
    <section className={styles.cta}>
      <div className="container">
        <h2 className={styles.title}>{title}</h2>
        {description && <p className={styles.description}>{description}</p>}
        <div className={styles.buttons}>
          {primary && (
            <Button to={primary.to} href={primary.href} variant="white">
              {primary.label}
            </Button>
          )}
          {secondary && (
            <Button to={secondary.to} href={secondary.href} variant="outlineLight">
              {secondary.label}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
