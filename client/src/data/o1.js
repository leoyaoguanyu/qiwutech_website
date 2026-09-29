import { FaRulerVertical, FaShoppingBag, FaBatteryThreeQuarters, FaCrosshairs } from 'react-icons/fa';
import { innovations } from './technology.js';

export const o1Hero = {
  image: '/images/omni4.png',
  imagePosition: 'right top',
  title: '启物O1 轮式人形机器人',
  subtitle: '智能感知，精准操作，高效移动',
};

export const o1Specs = [
  { id: 'height', icon: FaRulerVertical, value: '175 cm', label: '整机高度' },
  { id: 'payload', icon: FaShoppingBag, value: '5 kg', label: '单臂负载' },
  { id: 'battery', icon: FaBatteryThreeQuarters, value: '8小时', label: '续航时间' },
  { id: 'reach', icon: FaCrosshairs, value: '0-2 m', label: '作业高度' },
];

export const o1InnovationHeader = {
  title: '技术创新与核心优势',
  subtitle: '启物O1融合多项前沿技术，为智能机器人应用提供强大技术支撑',
};

export const o1Innovations = innovations;

export const o1DemoHeader = {
  title: '启物O1 展示视频',
  subtitle: '通过视频演示，深入了解启物O1机器人的实际表现和工作原理',
};

export const o1Demo = {
  src: '/video/videodemo1.webm',
  type: 'video/webm',
  poster: '/images/o1.2.png',
  title: '启物科技机器人Demo展示',
  description: '启物O1在仓储环境中自动搬运货物的实际操作演示',
};
