import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** 路由切换后回到页面顶部（SPA 默认会保留滚动位置） */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
