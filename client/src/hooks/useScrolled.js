import { useEffect, useState } from 'react';

/** 页面垂直滚动超过 threshold 像素时返回 true */
export default function useScrolled(threshold = 100) {
  const [scrolled, setScrolled] = useState(() => (typeof window !== 'undefined' ? window.scrollY > threshold : false));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return scrolled;
}
