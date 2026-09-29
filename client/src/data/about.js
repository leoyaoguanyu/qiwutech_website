import { FaGraduationCap, FaBuilding, FaTrophy, FaSearch, FaGlobe, FaUsers, FaHeart, FaEye, FaCheck, FaStar } from 'react-icons/fa';

export const companyIntro = {
  title: '公司简介',
  paragraphs: [
    '启物科技成立于2024年，致力于研发下一代具身智能大脑，打造高效的智能人形机器人及软硬件一体化解决方案。通过自研的推理框架与端侧高效推理系统，启物科技突破了机器人智能应用的技术瓶颈，推动了人形机器人在多个行业场景中的实际落地。',
    '启物科技汇聚了来自清华、北大、中科院等顶尖高校博士及华为、微软、百度等名企专家，团队具备深厚的技术积累与丰富的实践经验。',
    '凭借自研的底层推理框架，启物科技实现了低功耗高频率的大模型推理效果，打造了能最快落地的轮式双臂人形机器人，针对客户需求进行软硬件一体交付。',
    '其核心产品启物O1轮式人形机器人，已成功落地物流搬运、商超零售等多个场景，累计意向订单金额超千万元人民币，预计将在今年年内达到数百台交付，轮式双臂人形机器人启物O1将成为各种人形机器人中最快落地实际场景的机器人。',
  ],
  stats: [
    { id: 'founded', value: '2024', label: '成立年份' },
    { id: 'team', value: '50+', label: '团队规模' },
    { id: 'orders', value: '1000+', label: '万元订单' },
  ],
};

export const teamStrength = {
  title: '团队实力',
  subtitle: '我们的团队成员来自顶尖高校和知名企业，具备深厚的技术积累',
  pillars: [
    { id: 'universities', icon: FaGraduationCap, title: '顶尖学府', description: '清华、北大、中科院等顶尖高校博士团队' },
    { id: 'enterprises', icon: FaBuilding, title: '名企背景', description: '华为、微软、百度等知名企业技术专家' },
    { id: 'experience', icon: FaTrophy, title: '丰富经验', description: '深厚技术积累与丰富实践经验' },
  ],
};

export const futurePlanning = {
  title: '未来规划',
  intro: '启物科技计划在未来几年内，继续推进技术和硬件的优化，快速扩展市场，成为全球领先的具身智能机器人解决方案提供商。',
  pillars: [
    { id: 'rd', icon: FaSearch, title: '技术创新', description: '持续投入研发，推进核心技术突破' },
    { id: 'market', icon: FaGlobe, title: '市场扩展', description: '拓展国内外市场，实现全球化布局' },
    { id: 'ecosystem', icon: FaUsers, title: '生态建设', description: '构建合作伙伴生态，推动行业发展' },
  ],
};

export const missionVision = {
  title: '使命与愿景',
  mission: {
    icon: FaHeart,
    pointIcon: FaCheck,
    title: '我们的使命',
    description: '通过具身智能赋能机器人行业，推动智能机器人的商业化落地，改善行业效率，提升人类生活品质。',
    points: ['推动智能机器人商业化落地', '改善各行业运营效率', '提升人类生活品质'],
  },
  vision: {
    icon: FaEye,
    pointIcon: FaStar,
    title: '我们的愿景',
    description: '成为全球领先的具身智能机器人研发与解决方案提供商，助力智能科技改变全球产业面貌。',
    points: ['全球领先的技术创新', '完整的解决方案体系', '改变全球产业面貌'],
  },
};
