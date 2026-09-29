import { Link } from 'react-router-dom';
import { site, footerLinks } from '../../data/site.js';
import styles from './Footer.module.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.brand}>{site.name}</h3>
            <p className={styles.tagline}>{site.tagline}</p>
          </div>

          <div className={styles.section}>
            <h4>快速链接</h4>
            <ul className={styles.links}>
              {footerLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.section}>
            <h4>联系方式</h4>
            <p>
              电话: <a href={`tel:${site.contact.phone}`}>{site.contact.phone}</a>
            </p>
            <p>
              邮箱: <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
            </p>
            <p>地址: {site.contact.address}</p>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>
            &copy; {site.foundedYear === year ? year : `${site.foundedYear}-${year}`} {site.fullName}. 保留所有权利.
          </p>
        </div>
      </div>
    </footer>
  );
}
