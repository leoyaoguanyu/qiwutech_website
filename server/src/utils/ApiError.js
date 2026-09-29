/** 带 HTTP 状态码的业务错误，由 errorHandler 统一输出 */
export class ApiError extends Error {
  constructor(status, message, { code, errors } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}
