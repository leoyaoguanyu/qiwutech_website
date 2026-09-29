import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const safeEqual = (a, b) => {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};

/** 管理接口鉴权：请求头 x-admin-key 需与 ADMIN_API_KEY 一致 */
export function adminAuth(req, _res, next) {
  if (!env.adminApiKey) {
    return next(new ApiError(503, '管理接口未启用（未配置 ADMIN_API_KEY）', { code: 'ADMIN_DISABLED' }));
  }
  const provided = req.get('x-admin-key');
  if (!provided || !safeEqual(provided, env.adminApiKey)) {
    return next(new ApiError(401, '未授权', { code: 'UNAUTHORIZED' }));
  }
  return next();
}
