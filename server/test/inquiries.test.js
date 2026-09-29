import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.NODE_ENV = 'test';
process.env.ADMIN_API_KEY = 'test-admin-key';
process.env.MAIL_TO = 'sales@example.com';
process.env.SMTP_HOST = '';

const { createApp } = await import('../src/app.js');
const { createCaptcha, peekCaptchaForTest } = await import('../src/services/captchaService.js');
const { Inquiry } = await import('../src/models/Inquiry.js');

const app = createApp();

const validPayload = () => {
  const { token } = createCaptcha();
  return {
    name: '张三',
    country: '中国',
    phone: '+86 138-0000-0000',
    email: 'zhangsan@example.com',
    company: '示例公司',
    industry: '物流仓储',
    address: '北京市海淀区',
    content: '想了解启物O1在仓储搬运场景的报价与交付周期。',
    captchaToken: token,
    captcha: peekCaptchaForTest(token),
  };
};

describe('POST /api/inquiries —— 参数校验（无需数据库）', () => {
  test('空请求体返回 400 与按字段的错误列表', async () => {
    const res = await request(app).post('/api/inquiries').send({});
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.code, 'VALIDATION_ERROR');
    const fields = res.body.errors.map((e) => e.field);
    for (const f of ['name', 'country', 'phone', 'email', 'content', 'captchaToken', 'captcha']) {
      assert.ok(fields.includes(f), `应包含字段 ${f} 的错误`);
    }
  });

  test('非法邮箱 / 行业 / 电话被拒绝', async () => {
    const res = await request(app)
      .post('/api/inquiries')
      .send({ ...validPayload(), email: 'not-an-email', industry: '外星业', phone: 'abc' });
    assert.equal(res.status, 400);
    const byField = Object.fromEntries(res.body.errors.map((e) => [e.field, e.message]));
    assert.ok(byField.email);
    assert.ok(byField.industry);
    assert.ok(byField.phone);
  });

  test('验证码错误返回 400 CAPTCHA_INVALID', async () => {
    const res = await request(app).post('/api/inquiries').send({ ...validPayload(), captcha: '0000' });
    assert.equal(res.status, 400);
    assert.equal(res.body.code, 'CAPTCHA_INVALID');
    assert.equal(res.body.errors[0].field, 'captcha');
  });

  test('非 JSON 请求体返回 400', async () => {
    const res = await request(app).post('/api/inquiries').set('Content-Type', 'application/json').send('{bad json');
    assert.equal(res.status, 400);
    assert.equal(res.body.code, 'INVALID_JSON');
  });

  test('未知接口返回 404 JSON', async () => {
    const res = await request(app).get('/api/nope');
    assert.equal(res.status, 404);
    assert.equal(res.body.code, 'NOT_FOUND');
  });
});

describe('询盘完整流程（内存 MongoDB）', () => {
  let mongod;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  });

  after(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  });

  test('健康检查在数据库连接后返回 ok', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.database, 'connected');
  });

  test('合法提交 -> 201，入库并记录邮件发送状态', async () => {
    const payload = validPayload();
    const res = await request(app).post('/api/inquiries').send(payload);
    assert.equal(res.status, 201, JSON.stringify(res.body));
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.id);
    assert.equal(res.body.data.emailSent, true);

    const doc = await Inquiry.findById(res.body.data.id);
    assert.equal(doc.name, '张三');
    assert.equal(doc.email, 'zhangsan@example.com');
    assert.equal(doc.industry, '物流仓储');
    assert.equal(doc.status, 'new');
    assert.equal(doc.notifications.company.sent, true);
    assert.equal(doc.notifications.autoReply.sent, true);
  });

  test('蜜罐字段被填写时假装成功且不入库', async () => {
    const before = await Inquiry.countDocuments();
    const res = await request(app).post('/api/inquiries').send({ ...validPayload(), website: 'http://spam.example' });
    assert.equal(res.status, 201);
    assert.equal(await Inquiry.countDocuments(), before);
  });

  test('管理接口需要 x-admin-key', async () => {
    const noKey = await request(app).get('/api/inquiries');
    assert.equal(noKey.status, 401);

    const wrongKey = await request(app).get('/api/inquiries').set('x-admin-key', 'nope');
    assert.equal(wrongKey.status, 401);

    const ok = await request(app).get('/api/inquiries?limit=5').set('x-admin-key', 'test-admin-key');
    assert.equal(ok.status, 200);
    assert.equal(ok.body.pagination.total, 1);
    assert.equal(ok.body.data.length, 1);
    assert.equal(ok.body.data[0].name, '张三');
    assert.ok(ok.body.data[0].id);
  });

  test('PATCH 更新状态，非法状态被拒绝', async () => {
    const list = await request(app).get('/api/inquiries').set('x-admin-key', 'test-admin-key');
    const id = list.body.data[0].id;

    const bad = await request(app).patch(`/api/inquiries/${id}`).set('x-admin-key', 'test-admin-key').send({ status: 'wat' });
    assert.equal(bad.status, 400);

    const good = await request(app).patch(`/api/inquiries/${id}`).set('x-admin-key', 'test-admin-key').send({ status: 'contacted' });
    assert.equal(good.status, 200);
    assert.equal(good.body.data.status, 'contacted');

    const missing = await request(app).get('/api/inquiries/000000000000000000000000').set('x-admin-key', 'test-admin-key');
    assert.equal(missing.status, 404);
  });
});
