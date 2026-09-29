import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';
import { site, navigation } from '../../data/site.js';
import useScrolled from '../../hooks/useScrolled.js';
import styles from './Navbar.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

function DropdownItem({ item, open, onToggle }) {
  const location = useLocation();
  const isActive = item.children.some((child) => location.pathname.startsWith(child.path));

  return (
    <li className={cx(styles.dropdown, open && styles.dropdownOpen)}>
      <button
        type="button"
        className={cx(styles.link, styles.dropdownToggle, isActive && styles.active)}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={onToggle}
      >
        {item.label}
        <FaChevronDown className={styles.chevron} aria-hidden="true" />
      </button>
      <ul className={styles.dropdownMenu}>
        {item.children.map((child) => (
          <li key={child.path} className={styles.productItem}>
            <Link to={child.path} className={styles.productLink}>
              <span className={styles.productImage}>
                <img src={child.image} alt={child.alt} loading="lazy" />
              </span>
              <span className={styles.productName}>{child.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const scrolled = useScrolled(100);
  const { pathname } = useLocation();

  // 路由变化时收起移动端菜单
  useEffect(() => {
    setMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  // 移动端菜单打开时禁止背景滚动
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header className={cx(styles.navbar, scrolled && styles.scrolled)}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo} aria-label={`${site.name} 首页`}>
          <img src={site.logo} alt={`${site.name} Logo`} className={styles.logoImage} />
          <span className={styles.logoText}>
            <span className={styles.companyName}>{site.name}</span>
            <span className={styles.companyEnglish}>{site.englishName}</span>
          </span>
        </Link>

        <nav aria-label="主导航">
          <ul id="primary-menu" className={cx(styles.menu, menuOpen && styles.menuOpen)}>
            {navigation.map((item) =>
              item.children ? (
                <DropdownItem
                  key={item.label}
                  item={item}
                  open={openDropdown === item.label}
                  onToggle={() => setOpenDropdown((current) => (current === item.label ? null : item.label))}
                />
              ) : (
                <li key={item.path}>
                  <NavLink to={item.path} className={({ isActive }) => cx(styles.link, isActive && styles.active)}>
                    {item.label}
                  </NavLink>
                </li>
              ),
            )}
          </ul>
        </nav>

        <button
          type="button"
          className={styles.hamburger}
          aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
          aria-expanded={menuOpen}
          aria-controls="primary-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </header>
  );
}
