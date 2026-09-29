import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import BackToTop from './BackToTop.jsx';
import ScrollToTop from './ScrollToTop.jsx';

/** 所有页面共用的外壳：导航栏 + 页面内容 + 页脚 + 返回顶部 */
export default function Layout() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
