import { body, validationResult, matchedData } from 'express-validator';
import { INDUSTRIES, INQUIRY_LIMITS } from '@inspireomni/shared';
import { ApiError } from '../utils/ApiError.js';

const L = INQUIRY_LIMITS;

/** 允许数字、空格、+、-、括号，例如 +86 138-0000-0000 */
const PHONE_PATTERN = /^[0-9+\-\s()]+$/;

export const createInquiryRules = [
  body('name').trim().isLength({ min: L.name.min, max: L.name.max }).withMessage(`姓名需为 ${L.name.min}-${L.name.max} 个字符`),
  body('country').trim().isLength({ min: L.country.min, max: L.country.max }).withMessage('请填写国家/地区'),
  body('phone')
    .trim()
    .isLength({ min: L.phone.min, max: L.phone.max })
    .withMessage(`联系方式需为 ${L.phone.min}-${L.phone.max} 个字符`)
    .matches(PHONE_PATTERN)
    .withMessage('联系方式只能包含数字、空格、+、- 和括号'),
  body('email')
    .trim()
    .isLength({ max: L.email.max })
    .withMessage('邮箱过长')
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail({ gmail_remove_dots: false }),
  body('company').optional({ values: 'falsy' }).trim().isLength({ max: L.company.max }).withMessage(`公司名称不能超过 ${L.company.max} 个字符`),
  body('industry').optional({ values: 'falsy' }).trim().isIn(INDUSTRIES).withMessage('请选择有效的应用行业'),
  body('address').optional({ values: 'falsy' }).trim().isLength({ max: L.address.max }).withMessage(`联系地址不能超过 ${L.address.max} 个字符`),
  body('content').trim().isLength({ min: L.content.min, max: L.content.max }).withMessage(`内容需为 ${L.content.min}-${L.content.max} 个字符`),
  body('captchaToken').isString().withMessage('验证码已失效，请刷新后重试').bail().trim().notEmpty().withMessage('验证码已失效，请刷新后重试'),
  body('captcha').trim().isLength({ min: L.captcha.length, max: L.captcha.length }).withMessage(`请输入 ${L.captcha.length} 位验证码`),
  // 蜜罐字段：正常用户看不到，机器人往往会填
  body('website').optional().isString(),
];

/**
 * 汇总 express-validator 结果。
 * 校验失败 -> 400 + 按字段的错误列表；成功 -> 把清洗后的数据放到 req.validated
 */
export function validate(req, _res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const seen = new Set();
    const errors = [];
    for (const err of result.array()) {
      if (seen.has(err.path)) continue; // 每个字段只返回第一条错误
      seen.add(err.path);
      errors.push({ field: err.path, message: err.msg });
    }
    return next(new ApiError(400, '表单校验未通过，请检查填写内容', { code: 'VALIDATION_ERROR', errors }));
  }
  req.validated = matchedData(req, { locations: ['body'], includeOptionals: true });
  return next();
}
