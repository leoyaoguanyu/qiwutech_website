import { createCaptcha } from '../services/captchaService.js';

/** GET /api/captcha */
export function getCaptcha(_req, res) {
  const captcha = createCaptcha();
  res.set('Cache-Control', 'no-store');
  res.json({ success: true, data: captcha });
}
