import usePageMeta from '../hooks/usePageMeta.js';
import PageHero from '../components/ui/PageHero.jsx';
import Button from '../components/ui/Button.jsx';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  usePageMeta({ title: '页面未找到' });

  return (
    <>
      <PageHero title="404" subtitle="您访问的页面不存在或已被移动" />
      <section className={styles.body}>
        <div className="container">
          <Button to="/">返回首页</Button>
        </div>
      </section>
    </>
  );
}
