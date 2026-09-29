import usePageMeta from '../hooks/usePageMeta.js';
import PageHero from '../components/ui/PageHero.jsx';
import NewsCard from '../components/news/NewsCard.jsx';
import { newsItems } from '../data/news.js';
import styles from './NewsPage.module.css';

export default function NewsPage() {
  usePageMeta({
    title: '新闻中心',
    description: '了解启物科技的发展动态，最新产品资讯和行业新闻',
  });

  return (
    <>
      <PageHero title="新闻中心" subtitle="了解我们的发展动态" />

      <section className={styles.articles}>
        <div className="container">
          <div className={styles.grid}>
            {newsItems.map((item, index) => (
              <NewsCard key={item.id} {...item} index={index} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
