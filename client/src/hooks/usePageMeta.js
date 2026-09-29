import { useEffect } from 'react';
import { site } from '../data/site.js';

/**
 * 设置 document.title 与 meta description。
 * @param {{ title: string, description?: string, absolute?: boolean }} meta
 *   absolute=true 时不追加「- 启物科技」后缀
 */
export default function usePageMeta({ title, description, absolute = false }) {
  useEffect(() => {
    document.title = absolute ? title : `${title} - ${site.name}`;

    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', description);
    }
  }, [title, description, absolute]);
}
