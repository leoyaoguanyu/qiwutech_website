# API 接口文档

后端基于 Node.js + Express，所有接口均以 `/api` 为前缀，返回 JSON。

- 开发环境：`http://localhost:4000/api`（Vite 开发服务器会把 `/api` 代理到这里）
- 生产环境：`https://your-domain.com/api`（Nginx 反向代理到 127.0.0.1:4000）

## 通用约定

### 响应结构

```jsonc
// 成功
{ "success": true, "data": { ... }, "message": "可选提示" }

// 失败
{
  "success": false,
  "message": "人类可读的错误说明",
  "code": "VALIDATION_ERROR",          // 机器可读的错误码，见下表
  "errors": [                          // 仅表单校验类错误带有
    { "field": "email", "message": "请输入有效的邮箱地址" }
  ]
}
```

### 错误码

| HTTP | code | 含义 |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | 表单字段不合法，`errors` 中按字段列出 |
| 400 | `CAPTCHA_INVALID` | 验证码错误 / 过期 / 已使用 |
| 400 | `INVALID_JSON` | 请求体不是合法 JSON |
| 400 | `INVALID_STATUS` | 询盘状态取值非法 |
| 401 | `UNAUTHORIZED` | 管理接口缺少或错误的 `x-admin-key` |
| 404 | `NOT_FOUND` | 接口或资源不存在 |
| 413 | `PAYLOAD_TOO_LARGE` | 请求体超过 32kb |
| 429 | `RATE_LIMITED` | 触发限流 |
| 503 | `DB_UNAVAILABLE` | MongoDB 未连接（服务降级中） |
| 503 | `ADMIN_DISABLED` | 未配置 `ADMIN_API_KEY`，管理接口关闭 |

### 限流

| 范围 | 限制 |
| --- | --- |
| 全部 `/api/*` | 每 IP 15 分钟 300 次 |
| `GET /api/captcha` | 每 IP 15 分钟 60 次 |
| `POST /api/inquiries` | 每 IP 1 小时 10 次 |

响应头带标准的 `RateLimit-*` 字段。

---

## 公开接口

### `GET /api/health` — 健康检查

用于负载均衡探测与运维巡检。数据库未连接时返回 503。

```json
{ "status": "ok", "database": "connected", "uptime": 1234, "timestamp": "2025-08-01T08:00:00.000Z" }
```

### `GET /api/captcha` — 获取图形验证码

服务端生成 4 位验证码（不含易混淆的 0/O/1/I），以 SVG data URL 返回。每个 token 只能用一次，默认 5 分钟过期（`CAPTCHA_TTL_MS`）。

```json
{
  "success": true,
  "data": {
    "token": "5f5f2a0e-....",
    "image": "data:image/svg+xml;base64,PHN2Zy...",
    "expiresIn": 300
  }
}
```

### `POST /api/inquiries` — 提交联系表单

`Content-Type: application/json`

| 字段 | 必填 | 规则 |
| --- | --- | --- |
| `name` | ✅ | 1–50 字符 |
| `country` | ✅ | 1–50 字符 |
| `phone` | ✅ | 5–30 字符，仅数字、空格、`+`、`-`、括号 |
| `email` | ✅ | 合法邮箱 |
| `company` |  | ≤100 字符 |
| `industry` |  | 取值见 `shared/src/index.js` 中 `INDUSTRIES` |
| `address` |  | ≤200 字符 |
| `content` | ✅ | 5–2000 字符 |
| `captchaToken` | ✅ | 来自 `GET /api/captcha` |
| `captcha` | ✅ | 4 位验证码，不区分大小写 |
| `website` |  | 蜜罐字段，**必须留空**（前端隐藏，机器人填了会被静默丢弃） |

成功 `201`：

```json
{
  "success": true,
  "message": "消息发送成功！我们已收到您的咨询，会在 1-2 个工作日内回复您。",
  "data": { "id": "66b0...", "createdAt": "2025-08-01T08:00:00.000Z", "emailSent": true }
}
```

处理流程：校验字段 → 核销验证码 → 写入 MongoDB `inquiries` 集合 → 发送公司通知邮件 + 用户自动回复（失败不影响提交结果，状态记录在文档的 `notifications` 字段）。

curl 示例：

```bash
TOKEN_JSON=$(curl -s http://localhost:4000/api/captcha)
# 打开 image 看验证码，然后：
curl -s -X POST http://localhost:4000/api/inquiries \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "张三", "country": "中国", "phone": "13800000000",
    "email": "zhangsan@example.com", "industry": "物流仓储",
    "content": "想了解启物O1在仓储搬运场景的报价。",
    "captchaToken": "<token>", "captcha": "<看到的4位码>"
  }'
```

---

## 管理接口（需要 `x-admin-key` 请求头）

在 `server/.env` 里设置 `ADMIN_API_KEY`，请求时携带 `x-admin-key: <该值>`。未设置则返回 503。

### `GET /api/inquiries` — 询盘列表

查询参数：`page`（默认 1）、`limit`（默认 20，最大 100）、`status`（`new` / `contacted` / `closed`）

```json
{
  "success": true,
  "data": [ { "id": "...", "name": "张三", "email": "...", "status": "new", "createdAt": "...", ... } ],
  "pagination": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
}
```

### `GET /api/inquiries/:id` — 单条询盘

### `PATCH /api/inquiries/:id` — 更新处理状态

```json
{ "status": "contacted" }
```

```bash
curl -s http://localhost:4000/api/inquiries?status=new -H 'x-admin-key: <ADMIN_API_KEY>'
curl -s -X PATCH http://localhost:4000/api/inquiries/<id> \
  -H 'x-admin-key: <ADMIN_API_KEY>' -H 'Content-Type: application/json' \
  -d '{"status":"contacted"}'
```

---

## 数据模型：`Inquiry`

```js
{
  name, country, phone, email, company, industry, address, content,
  status: 'new' | 'contacted' | 'closed',
  notifications: {
    company:   { sent: Boolean, sentAt: Date, error: String },
    autoReply: { sent: Boolean, sentAt: Date, error: String },
  },
  meta: { ip, userAgent, referer },
  createdAt, updatedAt,
}
```

索引：`status`、`createdAt(-1)`。
