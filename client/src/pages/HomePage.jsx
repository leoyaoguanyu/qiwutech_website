import { FaArrowRight } from 'react-icons/fa';
import usePageMeta from '../hooks/usePageMeta.js';
import HeroBanner from '../components/ui/HeroBanner.jsx';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import FeatureCard from '../components/ui/FeatureCard.jsx';
import Button from '../components/ui/Button.jsx';
import NewsTicker from '../components/news/NewsTicker.jsx';
import { homeHero, homeFeaturesHeader, homeFeatures, companyIntroBanner, homeNewsHeader } from '../data/home.js';
import { newsItems } from '../data/news.js';
import styles from './HomePage.module.css';

export default function HomePage() {
  usePageMeta({
    title: '启物科技 - 智能机器人未来已来',
    description: '启物科技专注于智能机器人研发，启物O1机器人融合最先进的AI技术，为各行各业提供智能化解决方案',
    absolute: true,
  });

  return (
    <>
      {/* 首屏横幅 */}
      <HeroBanner image={homeHero.image} title={homeHero.title} subtitle={homeHero.subtitle} tone="dark" align="right">
        <Button to={homeHero.cta.to} icon={<FaArrowRight />}>
          {homeHero.cta.label}
        </Button>
      </HeroBanner>

      {/* 特性介绍 */}
      <section className={styles.features} aria-labelledby="home-features">
        <div className="container">
          <SectionHeader title={homeFeaturesHeader.title} subtitle={homeFeaturesHeader.subtitle} />
          <div className={styles.featureGrid}>
            {homeFeatures.map((feature) => (
              <FeatureCard key={feature.id} {...feature} variant="center" />
            ))}
          </div>
        </div>
      </section>

      {/* 公司介绍 */}
      <section className={styles.intro}>
        <div className="container">
          <div className={styles.introContent}>
            <div className={styles.introText}>
              <h2 className={styles.introTitle}>{companyIntroBanner.title}</h2>
              <div className={styles.introParagraphs}>
                {companyIntroBanner.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 20)}>{paragraph}</p>
                ))}
              </div>
              <Button to={companyIntroBanner.cta.to} icon={<FaArrowRight />}>
                {companyIntroBanner.cta.label}
              </Button>
            </div>
            <div className={styles.introImage}>
              <img src={companyIntroBanner.image.src} alt={companyIntroBanner.image.alt} loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* 新闻动态 */}
      <section className={styles.news}>
        <div className="container">
          <SectionHeader light title={homeNewsHeader.title} subtitle={homeNewsHeader.subtitle} />
          <NewsTicker items={newsItems} />
          <div className={styles.newsMore}>
            <Button to="/news" variant="ghostLight">
              查看更多 &gt;
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
