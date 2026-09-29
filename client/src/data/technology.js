import { FaBrain, FaBolt, FaCrosshairs, FaBell, FaMicrochip } from 'react-icons/fa';

/** 技术优势卡片：关于我们 & 技术页共用 */
export const techAdvantagesHeader = {
  title: '技术优势',
  subtitle: '启物科技的核心竞争力在于突破性的技术创新和强大的工程实现能力',
};

export const techAdvantages = [
  {
    id: 'navigation-model',
    icon: FaBrain,
    title: '操作导航大模型',
    description: '自研的操作导航大模型，能够理解复杂环境并做出智能决策，实现精准的路径规划和操作控制。',
    keywords: ['智能路径规划', '环境理解', '决策优化'],
  },
  {
    id: 'low-power-inference',
    icon: FaBolt,
    title: '低功耗高频率推理',
    description: '突破性的推理效果，实现低功耗高频率的实时推理，确保机器人在复杂环境中的高效运行。',
    keywords: ['实时推理', '低功耗设计', '高频率处理'],
  },
  {
    id: 'robot-control',
    icon: FaCrosshairs,
    title: '强大机器人控制',
    description: '先进的机器人控制系统，实现高精度操作和自动识别，支持复杂环境中的精准抓取和操作。',
    keywords: ['高精度操作', '自动识别', '精准抓取'],
  },
  {
    id: 'fast-deployment',
    icon: FaBell,
    title: '快速落地能力',
    description: '通过技术创新和产品优化，实现从研发到商业化的快速落地，满足市场需求。',
    keywords: ['快速部署', '商业化落地', '市场适应'],
  },
];

/** 技术创新（图文左右交错）：O1 产品页 & 技术页共用 */
export const innovations = [
  {
    id: 'end-to-end-model',
    icon: FaBrain,
    visualIcon: FaBrain,
    visualTheme: 'brain',
    title: '自研操作导航大模型',
    description: '启物O1机器人通过端到端训练，优化机器人大脑的理解能力和小脑的控制能力，具备精准抓取与自主导航能力。',
    features: ['端到端训练', '精准抓取', '自主导航', '智能理解'],
  },
  {
    id: 'inference-framework',
    icon: FaBolt,
    visualIcon: FaMicrochip,
    visualTheme: 'circuit',
    title: '低功耗推理框架',
    description: '支持低功耗高频率的推理，提升机器人在多场景中的应用表现，尤其适合长期作业。',
    features: ['低功耗设计', '高频率推理', '长期作业', '多场景适应'],
  },
];

export const technologyPage = {
  hero: {
    title: '核心技术',
    subtitle: '自研具身智能大脑与端侧高效推理系统',
  },
  innovationHeader: {
    title: '技术创新',
    subtitle: '从操作导航大模型到端侧推理框架，构建软硬件一体化的具身智能解决方案',
  },
  cta: {
    title: '了解启物O1如何将技术落地',
    description: '启物O1轮式人形机器人已成功落地物流搬运、商超零售等多个场景',
    primary: { label: '查看启物O1', to: '/products/o1' },
    secondary: { label: '联系我们', to: '/contact' },
  },
};
