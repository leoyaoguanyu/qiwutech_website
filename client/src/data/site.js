/** 站点级信息：单一数据源，导航 / 页脚 / 联系页 / 邮件模板都从这里取 */
export const site = {
  name: '启物科技',
  englishName: 'INSPIREOMNI',
  fullName: '启物科技 Inspireomni',
  logo: '/images/logo.png',
  foundedYear: 2024,
  tagline: '专注于下一代具身智能大脑，打造轮式人形机器人，为工业农业场景提供智能机器人解决方案。',
  contact: {
    phone: '400-888-8888',
    email: 'puzz@inspireomni.ai',
    address: '北京海淀区东升大厦4楼',
    hours: '周一至周五 9:30-18:00',
  },
};

export const products = [
  {
    id: 'o1',
    name: 'O1',
    fullName: '启物O1 轮式人形机器人',
    path: '/products/o1',
    image: '/images/o1.3.png',
  },
];

/** 顶部导航；带 children 的项渲染为下拉菜单 */
export const navigation = [
  {
    label: '机器人',
    children: products.map((p) => ({ label: p.name, path: p.path, image: p.image, alt: p.fullName })),
  },
  { label: '关于我们', path: '/about' },
  { label: '技术', path: '/technology' },
  { label: '新闻中心', path: '/news' },
  { label: '联系我们', path: '/contact' },
];

export const footerLinks = [
  { label: 'O1', path: '/products/o1' },
  { label: '关于我们', path: '/about' },
  { label: '技术', path: '/technology' },
  { label: '新闻中心', path: '/news' },
  { label: '联系我们', path: '/contact' },
];
