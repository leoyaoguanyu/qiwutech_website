import usePageMeta from '../hooks/usePageMeta.js';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import StatItem from '../components/ui/StatItem.jsx';
import IconPillar from '../components/ui/IconPillar.jsx';
import FeatureCard from '../components/ui/FeatureCard.jsx';
import ValueCard from '../components/ui/ValueCard.jsx';
import { companyIntro, teamStrength, futurePlanning, missionVision } from '../data/about.js';
import { techAdvantagesHeader, techAdvantages } from '../data/technology.js';
import styles from './AboutPage.module.css';

export default function AboutPage() {
  usePageMeta({
    title: '关于我们',
    description: '启物科技专注于研发智能人形机器人的端侧大脑，打造下一代智能机器人硬软件一体化解决方案',
  });

  return (
    <>
      {/* 公司简介 */}
      <section className={styles.intro}>
        <div className="container">
          <div className={styles.introText}>
            <SectionHeader title={companyIntro.title} underline as="h1" className={styles.introHeader} />
            <div className={styles.paragraphs}>
              {companyIntro.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 20)}>{paragraph}</p>
              ))}
            </div>
            <div className={styles.stats}>
              {companyIntro.stats.map((stat) => (
                <StatItem key={stat.id} {...stat} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 团队实力 */}
      <section className={styles.team}>
        <div className="container">
          <div className={styles.card}>
            <SectionHeader title={teamStrength.title} subtitle={teamStrength.subtitle} />
            <div className={styles.pillars}>
              {teamStrength.pillars.map((pillar) => (
                <IconPillar key={pillar.id} {...pillar} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 技术优势 */}
      <section className={styles.tech}>
        <div className="container">
          <SectionHeader title={techAdvantagesHeader.title} underline subtitle={techAdvantagesHeader.subtitle} />
          <div className={styles.techGrid}>
            {techAdvantages.map((item) => (
              <FeatureCard key={item.id} {...item} variant="left" />
            ))}
          </div>
        </div>
      </section>

      {/* 未来规划 */}
      <section className={styles.planning}>
        <div className="container">
          <div className={styles.card}>
            <SectionHeader title={futurePlanning.title} subtitle={futurePlanning.intro} />
            <div className={styles.pillars}>
              {futurePlanning.pillars.map((pillar) => (
                <IconPillar key={pillar.id} {...pillar} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 使命与愿景 */}
      <section className={styles.mission}>
        <div className="container">
          <SectionHeader title={missionVision.title} underline />
          <div className={styles.valueCards}>
            <ValueCard {...missionVision.mission} variant="filled" />
            <ValueCard {...missionVision.vision} variant="plain" />
          </div>
        </div>
      </section>
    </>
  );
}
