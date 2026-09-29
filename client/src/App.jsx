import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import O1Page from './pages/O1Page.jsx';
import AboutPage from './pages/AboutPage.jsx';
import TechnologyPage from './pages/TechnologyPage.jsx';
import NewsPage from './pages/NewsPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

/** 旧静态站点的 .html 地址 -> 新路由，保证外部旧链接不失效 */
const legacyRedirects = {
  '/index.html': '/',
  '/o1.html': '/products/o1',
  '/about.html': '/about',
  '/news.html': '/news',
  '/contact.html': '/contact',
};

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="products/o1" element={<O1Page />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="technology" element={<TechnologyPage />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="contact" element={<ContactPage />} />
        {Object.entries(legacyRedirects).map(([from, to]) => (
          <Route key={from} path={from} element={<Navigate to={to} replace />} />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
