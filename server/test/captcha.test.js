import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.CAPTCHA_TTL_MS = '200';

const { createApp } = await import('../src/app.js');
const { createCaptcha, verifyCaptcha, peekCaptchaForTest } = await import('../src/services/captchaService.js');

describe('验证码服务', () => {
  test('GET /api/captcha 返回 token 与 SVG 图片', async () => {
    const res = await request(createApp()).get('/api/captcha');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.match(res.body.data.token, /^[0-9a-f-]{36}$/);
    assert.match(res.body.data.image, /^data:image\/svg\+xml;base64,/);
    assert.equal(res.headers['cache-control'], 'no-store');
  });

  test('正确答案只能核销一次，大小写不敏感', () => {
    const { token } = createCaptcha();
    const code = peekCaptchaForTest(token);
    assert.equal(verifyCaptcha(token, code.toLowerCase()).ok, true);
    assert.deepEqual(verifyCaptcha(token, code), { ok: false, reason: 'missing' });
  });

  test('错误答案返回 mismatch 并作废该 token', () => {
    const { token } = createCaptcha();
    assert.deepEqual(verifyCaptcha(token, 'ZZZZ'), { ok: false, reason: 'mismatch' });
    assert.deepEqual(verifyCaptcha(token, peekCaptchaForTest(token)), { ok: false, reason: 'missing' });
  });

  test('过期后返回 expired', async () => {
    const { token } = createCaptcha();
    const code = peekCaptchaForTest(token);
    await new Promise((resolve) => setTimeout(resolve, 250));
    assert.deepEqual(verifyCaptcha(token, code), { ok: false, reason: 'expired' });
  });
});
