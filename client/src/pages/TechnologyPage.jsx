import usePageMeta from '../hooks/usePageMeta.js';
import PageHero from '../components/ui/PageHero.jsx';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import FeatureCard from '../components/ui/FeatureCard.jsx';
import CtaBanner from '../components/ui/CtaBanner.jsx';
import InnovationItem from '../components/product/InnovationItem.jsx';
import { technologyPage, techAdvantagesHeader, techAdvantages, innovations } from '../data/technology.js';
import styles from './TechnologyPage.module.css';

export default function TechnologyPage() {
  usePageMeta({
    title: '核心技术',
    description: '启物科技自研操作导航大模型与低功耗推理框架，打造软硬件一体化的具身智能机器人解决方案',
  });

  return (
    <>
      <PageHero title={technologyPage.hero.title} subtitle={technologyPage.hero.subtitle} />

      {/* 技术优势 */}
      <section className={styles.advantages}>
        <div className="container">
          <SectionHeader title={techAdvantagesHeader.title} underline subtitle={techAdvantagesHeader.subtitle} />
          <div className={styles.grid}>
            {techAdvantages.map((item) => (
              <FeatureCard key={item.id} {...item} variant="left" />
            ))}
          </div>
        </div>
      </section>

      {/* 技术创新 */}
      <section className={styles.innovation}>
        <div className="container">
          <SectionHeader title={technologyPage.innovationHeader.title} subtitle={technologyPage.innovationHeader.subtitle} />
          <div className={styles.innovationList}>
            {innovations.map((item, index) => (
              <InnovationItem key={item.id} {...item} reverse={index % 2 === 1} />
            ))}
          </div>
        </div>
      </section>

      <CtaBanner {...technologyPage.cta} />
    </>
  );
}
