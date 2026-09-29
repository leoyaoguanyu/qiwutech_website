import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { ApiError } from '../utils/ApiError.js';

export function notFound(req, _res, next) {
  next(new ApiError(404, `接口不存在: ${req.method} ${req.originalUrl}`, { code: 'NOT_FOUND' }));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let status = err.status || err.statusCode || 500;
  let message = err.message || '服务器内部错误';
  let code = err.code;

  // body-parser 抛出的 JSON 语法错误
  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = '请求体不是合法的 JSON';
    code = 'INVALID_JSON';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = '请求体过大';
    code = 'PAYLOAD_TOO_LARGE';
  } else if (err.name === 'ValidationError' && err.errors) {
    // Mongoose 校验错误（正常情况下已被 express-validator 拦截）
    status = 400;
    code = 'VALIDATION_ERROR';
    message = '数据校验未通过';
  } else if (err.name === 'CastError') {
    status = 400;
    code = 'INVALID_ID';
    message = '无效的资源 ID';
  }

  const expected = err instanceof ApiError;

  if (status >= 500) {
    if (expected) {
      // 业务上预期的 5xx（如数据库未连接），一行即可
      logger.warn(`${status} ${code || ''} ${message}`);
    } else {
      logger.error(`${message}\n${err.stack || ''}`);
      if (env.isProduction) message = '服务器内部错误，请稍后再试';
    }
  }

  const payload = { success: false, message };
  if (code) payload.code = code;
  if (expected && err.errors) payload.errors = err.errors;
  // 仅开发环境、仅未预期的错误才把堆栈返回给调用方
  if (!env.isProduction && !expected && status >= 500 && err.stack) payload.stack = err.stack;

  res.status(status).json(payload);
}
