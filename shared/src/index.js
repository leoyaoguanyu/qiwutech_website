/**
 * 前后端共享的常量。
 * - 前端用它渲染下拉选项 / 表单限制
 * - 后端用它做请求校验，保证两端规则一致
 */

/** 联系表单「应用行业」可选项 */
export const INDUSTRIES = [
  '制造业',
  '物流仓储',
  '零售商业',
  '医疗健康',
  '教育培训',
  '农业',
  '建筑',
  '其他',
];

/** 联系表单各字段长度限制 */
export const INQUIRY_LIMITS = {
  name: { min: 1, max: 50 },
  country: { min: 1, max: 50 },
  phone: { min: 5, max: 30 },
  company: { min: 0, max: 100 },
  email: { min: 3, max: 254 },
  address: { min: 0, max: 200 },
  content: { min: 5, max: 2000 },
  captcha: { length: 4 },
};

/** 验证码字符长度 */
export const CAPTCHA_LENGTH = INQUIRY_LIMITS.captcha.length;
