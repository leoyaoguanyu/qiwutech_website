import crypto from 'node:crypto';
import { CAPTCHA_LENGTH } from '@inspireomni/shared';
import { env } from '../config/env.js';

/**
 * 服务端图形验证码。
 * 旧版站点在浏览器里生成验证码并把答案挂在 window 上，等于没有校验；
 * 现在由服务端生成 SVG 并保存答案，提交时一次性核销。
 *
 * 存储为进程内 Map（单实例够用）。多实例部署请改为 Redis，见 docs/DEPLOYMENT.md。
 */

// 去掉易混淆字符 0/O/1/I
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const store = new Map(); // token -> { code, expiresAt }

const randomInt = (min, max) => crypto.randomInt(min, max + 1);
const randomColor = (alpha = 1) =>
  `rgba(${randomInt(40, 160)}, ${randomInt(40, 160)}, ${randomInt(120, 220)}, ${alpha})`;

function generateCode(length = CAPTCHA_LENGTH) {
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += ALPHABET[randomInt(0, ALPHABET.length - 1)];
  }
  return code;
}

function renderSvg(code) {
  const width = 120;
  const height = 40;
  const slot = width / (code.length + 1);

  const letters = [...code]
    .map((ch, i) => {
      const x = slot * (i + 1);
      const y = randomInt(24, 30);
      const rotate = randomInt(-20, 20);
      const size = randomInt(20, 26);
      return `<text x="${x}" y="${y}" font-size="${size}" font-family="Arial, sans-serif" font-weight="700" fill="${randomColor()}" text-anchor="middle" transform="rotate(${rotate} ${x} ${y})">${ch}</text>`;
    })
    .join('');

  const lines = Array.from({ length: 3 }, () =>
    `<line x1="${randomInt(0, width)}" y1="${randomInt(0, height)}" x2="${randomInt(0, width)}" y2="${randomInt(0, height)}" stroke="${randomColor(0.5)}" stroke-width="1.5"/>`,
  ).join('');

  const dots = Array.from({ length: 20 }, () =>
    `<circle cx="${randomInt(0, width)}" cy="${randomInt(0, height)}" r="1.2" fill="${randomColor(0.6)}"/>`,
  ).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#f8fafc"/>${lines}${dots}${letters}</svg>`;
}

function purgeExpired() {
  const now = Date.now();
  for (const [token, entry] of store) {
    if (entry.expiresAt <= now) store.delete(token);
  }
}

// 定期清理过期验证码；unref 让它不阻止进程退出（测试场景）
const purgeTimer = setInterval(purgeExpired, 60 * 1000);
purgeTimer.unref();

export function createCaptcha() {
  const code = generateCode();
  const token = crypto.randomUUID();
  const expiresAt = Date.now() + env.captchaTtlMs;
  store.set(token, { code, expiresAt });

  const svg = renderSvg(code);
  return {
    token,
    image: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
    expiresIn: Math.floor(env.captchaTtlMs / 1000),
  };
}

/**
 * 校验并核销验证码（无论成功与否都只能用一次）。
 * @returns {{ ok: boolean, reason?: 'missing' | 'expired' | 'mismatch' }}
 */
export function verifyCaptcha(token, answer) {
  if (!token || !store.has(token)) return { ok: false, reason: 'missing' };

  const entry = store.get(token);
  store.delete(token);

  if (entry.expiresAt <= Date.now()) return { ok: false, reason: 'expired' };
  if (String(answer || '').trim().toUpperCase() !== entry.code) return { ok: false, reason: 'mismatch' };
  return { ok: true };
}

export const CAPTCHA_ERROR_MESSAGES = {
  missing: '验证码已失效，请刷新后重试',
  expired: '验证码已过期，请刷新后重试',
  mismatch: '验证码错误，请重新输入',
};

/** 仅供测试读取答案 */
export function peekCaptchaForTest(token) {
  if (!env.isTest) throw new Error('peekCaptchaForTest 只能在测试环境使用');
  return store.get(token)?.code;
}

export function captchaStoreSize() {
  return store.size;
}
