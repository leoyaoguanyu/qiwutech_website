/**
 * 与后端 REST API 的交互层。
 * 默认走同源 /api（开发由 Vite 代理、生产由 Nginx 转发）；
 * 前后端分离部署时通过 VITE_API_BASE_URL 指定完整地址。
 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, { status, code, fieldErrors } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors || {};
  }
}

async function request(path, { method = 'GET', body, headers, signal } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('网络连接失败，请检查网络后重试', { code: 'NETWORK_ERROR' });
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const fieldErrors = Object.fromEntries((payload?.errors || []).map((e) => [e.field, e.message]));
    throw new ApiError(payload?.message || `请求失败 (${response.status})`, {
      status: response.status,
      code: payload?.code,
      fieldErrors,
    });
  }

  return payload;
}

/** 获取图形验证码 -> { token, image, expiresIn } */
export async function fetchCaptcha(options) {
  const res = await request('/captcha', options);
  return res.data;
}

/** 提交联系表单 -> { id, createdAt, emailSent } */
export async function submitInquiry(payload, options) {
  const res = await request('/inquiries', { method: 'POST', body: payload, ...options });
  return { message: res.message, ...res.data };
}

/** 健康检查 */
export function fetchHealth(options) {
  return request('/health', options);
}
