import { FaMapMarkerAlt, FaEnvelope, FaClock } from 'react-icons/fa';
import { site } from './site.js';

export const contactPage = {
  hero: {
    title: '联系我们',
    subtitle: '获取智能机器人解决方案的详细信息',
  },
  info: [
    { id: 'address', icon: FaMapMarkerAlt, title: '地址', value: site.contact.address },
    { id: 'email', icon: FaEnvelope, title: '邮箱', value: site.contact.email, href: `mailto:${site.contact.email}` },
    { id: 'hours', icon: FaClock, title: '工作时间', value: site.contact.hours },
  ],
  disclaimer:
    '通过提交此表单，即表示您同意我们的使用条款和隐私政策。隐私政策阐述了我们将如何收集、使用及披露您的个人信息，包括向第三方披露的情形。',
};
