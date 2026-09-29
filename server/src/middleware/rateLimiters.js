import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const common = {
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => env.isTest,
  handler: (_req, res, _next, options) => {
    res.status(options.statusCode).json({
      success: false,
      code: 'RATE_LIMITED',
      message: '请求过于频繁，请稍后再试',
    });
  },
};

/** 全局：每 IP 15 分钟 300 次 */
export const apiLimiter = rateLimit({ ...common, windowMs: 15 * 60 * 1000, limit: 300 });

/** 验证码：每 IP 15 分钟 60 次 */
export const captchaLimiter = rateLimit({ ...common, windowMs: 15 * 60 * 1000, limit: 60 });

/** 提交询盘：每 IP 1 小时 10 次 */
export const inquiryLimiter = rateLimit({ ...common, windowMs: 60 * 60 * 1000, limit: 10 });
