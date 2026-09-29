/** 新闻列表，按日期倒序。首页滚动条与新闻中心共用 */
export const newsItems = [
  {
    id: 'waic-2025',
    title: '启物参展 | 2025WAIC世界人工智能大会',
    summary: '启物科技将亮相2025世界人工智能大会，展示最新具身智能技术成果...',
    url: 'https://mp.weixin.qq.com/s/Qlk5baRkpxJ99cyLZM3aJA',
    date: '2025-07-23',
    image: '/images/new1.png',
    alt: '2025WAIC世界人工智能大会海报',
  },
  {
    id: 'dialogue-first-principles',
    title: '对话启物：第一性原理看具身落地',
    summary: '深入探讨具身智能的技术原理和实际应用落地...',
    url: 'https://mp.weixin.qq.com/s/n4TSRXfKK8Y1FqzjXKehXg',
    date: '2025-05-15',
    image: '/images/new2.jpg',
    alt: '启物科技机器人',
  },
  {
    id: 'zhongguancun-forum',
    title: '启物合作 | 中关村人工智能高峰论坛',
    summary: '启物科技参与中关村人工智能高峰论坛，探讨AI技术发展趋势...',
    url: 'https://mp.weixin.qq.com/s/Rb5eDqPPTeTUamX6KXdNSA',
    date: '2025-05-13',
    image: '/images/new3.png',
    alt: '启物科技机器人',
  },
  {
    id: 'btv-vending',
    title: '启物动态 | 科博会启物O1自动售卖登上北京卫视',
    summary: '启物O1机器人在科博会上的精彩表现，自动售卖功能获得北京卫视关注报道...',
    url: 'https://mp.weixin.qq.com/s/1YGJDNEXK0WTpRfr0AFnhQ',
    date: '2025-05-12',
    image: '/images/new4.png',
    alt: '启物O1自动售卖登上北京卫视',
  },
  {
    id: 'haidian-spring',
    title: '启物O1亮相海淀机器人"春忙图景"',
    summary: '启物O1机器人参与海淀区机器人展示活动，展现智能机器人在春季应用场景中的重要作用...',
    url: 'https://mp.weixin.qq.com/s/x3bhlKqdmApHIAj8x5zzUw',
    date: '2025-03-10',
    image: '/images/new5.png',
    alt: '启物O1亮相海淀机器人春忙图景',
  },
  {
    id: 'lantern-festival-2025',
    title: '2025启物科技祝你元宵喜乐',
    summary: '启物科技在元宵佳节送上温馨祝福，愿与合作伙伴和用户共同迎接智能机器人新时代...',
    url: 'https://mp.weixin.qq.com/s/MtxzuHTGmurkGzZ2RzduXg',
    date: '2025-02-12',
    image: '/images/new6.png',
    alt: '2025启物科技元宵节祝福',
  },
];

/** 2025-07-23 -> 2025/07/23 */
export const formatNewsDate = (iso) => iso.replaceAll('-', '/');
