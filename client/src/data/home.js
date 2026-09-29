import { FaBrain, FaCogs, FaUsers, FaLightbulb } from 'react-icons/fa';

export const homeHero = {
  image: '/images/o1.1.jpg',
  title: '启物O1 轮式人形机器人',
  subtitle: '智能感知，精准操作，高效移动',
  cta: { label: '了解更多', to: '/products/o1' },
};

export const homeFeaturesHeader = {
  title: '引领智能机器人新时代',
  subtitle: '启物科技致力于打造下一代智能机器人，通过创新技术为各行各业提供智能化解决方案，推动产业数字化转型。',
};

export const homeFeatures = [
  { id: 'ai', icon: FaBrain, title: '前沿AI技术', description: '融合深度学习、计算机视觉等前沿AI技术，实现智能决策与自主学习。' },
  { id: 'manufacturing', icon: FaCogs, title: '精密制造', description: '采用先进制造工艺，确保机器人的稳定性、可靠性和精准性。' },
  { id: 'team', icon: FaUsers, title: '顶尖团队', description: '汇聚清华、北大等顶尖高校及知名企业的AI专家和技术精英。' },
  { id: 'innovation', icon: FaLightbulb, title: '持续创新', description: '不断探索机器人技术边界，推动智能机器人产业发展。' },
];

export const companyIntroBanner = {
  title: '科技创新，智引未来',
  paragraphs: [
    '启物科技成立于2024年，致力于研发下一代具身智能大脑，打造高效的智能人形机器人及软硬件一体化解决方案。通过自研的推理框架与端侧高效推理系统，启物科技突破了机器人智能应用的技术瓶颈，推动了人形机器人在多个行业场景中的实际落地。',
    '启物科技汇聚了来自清华、北大、中科院等顶尖高校博士及华为、微软、百度等名企专家，团队具备深厚的技术积累与丰富的实践经验。凭借自研的底层推理框架，启物科技实现了低功耗高频率的大模型推理效果，打造了能最快落地的轮式双臂人形机器人。',
  ],
  image: { src: '/images/new4.png', alt: '启物科技办公环境' },
  cta: { label: '了解更多', to: '/about' },
};

export const homeNewsHeader = {
  title: '新闻动态',
  subtitle: '关注启物科技的最新资讯，获取企业技术突破和市场动态的最新信息',
};
