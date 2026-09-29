import usePageMeta from '../hooks/usePageMeta.js';
import HeroBanner from '../components/ui/HeroBanner.jsx';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import SpecItem from '../components/product/SpecItem.jsx';
import InnovationItem from '../components/product/InnovationItem.jsx';
import VideoPlayer from '../components/product/VideoPlayer.jsx';
import { o1Hero, o1Specs, o1InnovationHeader, o1Innovations, o1DemoHeader, o1Demo } from '../data/o1.js';
import styles from './O1Page.module.css';

export default function O1Page() {
  usePageMeta({
    title: '启物O1机器人',
    description: '启物O1机器人 - 融合最新AI技术的智能机器人，具备流线型外观设计和卓越的技术性能',
  });

  return (
    <>
      {/* 第一屏：背景图 + 介绍 */}
      <HeroBanner
        image={o1Hero.image}
        imagePosition={o1Hero.imagePosition}
        title={o1Hero.title}
        subtitle={o1Hero.subtitle}
        tone="light"
        align="left"
      />

      {/* 第二屏：产品规格 */}
      <section className={styles.specs}>
        <div className="container">
          <SectionHeader title="产品规格" />
          <div className={styles.specGrid}>
            {o1Specs.map((spec) => (
              <SpecItem key={spec.id} {...spec} />
            ))}
          </div>
        </div>
      </section>

      {/* 第三屏：技术创新与核心优势 */}
      <section className={styles.innovation}>
        <div className="container">
          <SectionHeader title={o1InnovationHeader.title} subtitle={o1InnovationHeader.subtitle} />
          <div className={styles.innovationList}>
            {o1Innovations.map((item, index) => (
              <InnovationItem key={item.id} {...item} reverse={index % 2 === 1} />
            ))}
          </div>
        </div>
      </section>

      {/* 第四屏：展示视频 */}
      <section className={styles.demo}>
        <div className="container">
          <SectionHeader title={o1DemoHeader.title} subtitle={o1DemoHeader.subtitle} />
          <VideoPlayer {...o1Demo} />
        </div>
      </section>
    </>
  );
}
