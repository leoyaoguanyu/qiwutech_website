# 启物科技官方网站 · InspireOmni

启物科技（InspireOmni）企业官网，展示核心产品「启物O1 轮式人形机器人」、公司介绍、核心技术、新闻动态与联系方式。

本版本由原来的纯静态页面（HTML + CSS + JS + EmailJS）重构为 **React 单页应用 + Node.js/Express REST API + MongoDB** 的全栈项目，联系表单改为服务端校验、入库并触发邮件通知，部署在阿里云 ECS。

## 技术栈

| 层 | 技术 |
| --- | --- |
| 前端 | React 19 · React Router 7 · Vite 7 · CSS Modules · react-icons |
| 后端 | Node.js 22 · Express 4 · express-validator · helmet · express-rate-limit |
| 数据库 | MongoDB 7 · Mongoose 8 |
| 邮件 | Nodemailer（SMTP，兼容阿里云邮件推送 / 企业邮箱） |
| 测试 | Node 内置测试运行器 · supertest · mongodb-memory-server |
| 部署 | 阿里云 ECS · Nginx · PM2 · 阿里云云解析 DNS / SSL 证书 |

## 项目结构

```
.
├── client/                       # React 前端（Vite）
│   ├── public/                   # 静态资源：images/ video/ favicon_io/
│   └── src/
│       ├── components/
│       │   ├── layout/           # Navbar（含产品下拉、移动端菜单）、Footer、BackToTop、Layout
│       │   ├── ui/               # 可复用原子组件：Button、HeroBanner、PageHero、SectionHeader、
│       │   │                     #   FeatureCard、IconPillar、StatItem、ValueCard、CtaBanner
│       │   ├── news/             # NewsCard、NewsTicker（首页无缝滚动）
│       │   ├── product/          # SpecItem、InnovationItem、VideoPlayer
│       │   └── contact/          # ContactForm、FormField、Captcha、ContactInfo
│       ├── pages/                # Home / O1 / About / Technology / News / Contact / NotFound
│       ├── data/                 # 页面文案与结构化内容（单一数据源）
│       ├── hooks/                # useScrolled、usePageMeta
│       ├── services/api.js       # 与后端 REST API 交互
│       └── styles/index.css      # 设计变量与全局样式
├── server/                       # Express API
│   ├── src/
│   │   ├── app.js                # 中间件、路由挂载、错误处理、可选静态托管
│   │   ├── index.js              # 启动入口：连接 MongoDB、监听端口、优雅退出
│   │   ├── config/               # env（.env 读取与校验）、db（带重试的连接）
│   │   ├── routes/               # /api/health  /api/captcha  /api/inquiries
│   │   ├── controllers/          # 请求处理
│   │   ├── validators/           # express-validator 规则
│   │   ├── services/             # captchaService（服务端验证码）、mailService（邮件通知）
│   │   ├── middleware/           # 限流、管理鉴权、错误处理
│   │   ├── models/Inquiry.js     # Mongoose 模型
│   │   └── utils/
│   ├── test/                     # 集成测试
│   └── .env.example
├── shared/                       # 前后端共用常量（行业列表、字段长度限制）
├── deploy/
│   ├── nginx/                    # Nginx 站点配置
│   ├── pm2/ecosystem.config.cjs  # PM2 进程配置
│   ├── setup-ecs.sh              # ECS 初始化脚本
│   └── deploy.sh                 # 一键发布脚本
├── docs/
│   ├── API.md                    # 接口文档
│   ├── DEPLOYMENT.md             # 阿里云部署指南
│   └── TROUBLESHOOTING.md        # 故障排查手册
├── docker-compose.yml            # 本地开发用 MongoDB
└── package.json                  # npm workspaces 根
```

## 页面与路由

| 路由 | 页面 | 说明 |
| --- | --- | --- |
| `/` | 首页 | 品牌横幅、特性介绍、公司简介、新闻滚动 |
| `/products/o1` | 启物O1 | 产品规格、技术创新、演示视频 |
| `/about` | 关于我们 | 公司简介、团队实力、技术优势、未来规划、使命愿景 |
| `/technology` | 核心技术 | 技术优势、技术创新、行动号召 |
| `/news` | 新闻中心 | 新闻卡片列表（跳转公众号文章） |
| `/contact` | 联系我们 | 联系方式 + 联系表单（服务端验证码、校验、入库、邮件） |

旧静态站的 `*.html` 地址会自动跳转到新路由。

## 快速开始

环境要求：Node.js ≥ 20、npm ≥ 9、MongoDB（本地安装或 Docker）。

```bash
# 1. 安装全部依赖（npm workspaces，一次装完 client / server / shared）
npm install

# 2. 启动本地 MongoDB（可选，没有数据库时 API 以降级模式运行，仅提交表单不可用）
docker compose up -d mongo

# 3. 配置后端环境变量
cp server/.env.example server/.env      # 本地开发保持默认即可；SMTP 留空则邮件只打印到日志

# 4. 同时启动前端 (http://localhost:5173) 与后端 (http://localhost:4000)
npm run dev
```

其他命令：

```bash
npm run build          # 构建前端到 client/dist
npm start              # 生产模式启动 API
npm test               # 运行后端测试（首次会下载 mongod 二进制用于内存数据库）
npm run dev -w client  # 只起前端
npm run dev -w server  # 只起后端（nodemon）
```

## 后端 API 概览

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/health` | 健康检查（含数据库连接状态） |
| GET | `/api/captcha` | 获取服务端图形验证码（SVG） |
| POST | `/api/inquiries` | 提交联系表单：校验 → 核销验证码 → 写入 MongoDB → 发送通知邮件 + 自动回复 |
| GET | `/api/inquiries` | 询盘列表（分页 / 按状态筛选，需 `x-admin-key`） |
| GET | `/api/inquiries/:id` | 询盘详情（需 `x-admin-key`） |
| PATCH | `/api/inquiries/:id` | 更新处理状态（需 `x-admin-key`） |

完整字段、错误码、限流策略见 [docs/API.md](docs/API.md)。

安全措施：helmet 安全头、CORS 白名单、请求体 32kb 上限、分级限流、服务端一次性验证码、蜜罐字段、邮件模板 HTML 转义、管理接口密钥常量时间比较。

## 环境变量

见 [server/.env.example](server/.env.example)（每一项都有注释）。关键项：

| 变量 | 说明 |
| --- | --- |
| `MONGODB_URI` | MongoDB 连接串 |
| `SMTP_HOST/PORT/SECURE/USER/PASS` | 发信服务器；留空 `SMTP_HOST` 则不真正发信 |
| `MAIL_FROM` / `MAIL_TO` | 发件人 / 接收询盘的公司邮箱 |
| `ADMIN_API_KEY` | 管理接口密钥，留空则关闭管理接口 |
| `CLIENT_ORIGINS` | 生产环境允许的前端来源（CORS） |
| `TRUST_PROXY` | 位于 Nginx 后时设为 `true` |
| `SERVE_CLIENT` | 让 Express 直接托管 `client/dist`（不用 Nginx 时） |

前端可选变量见 [client/.env.example](client/.env.example)。

## 部署

阿里云 ECS + Nginx + PM2 的完整步骤（安全组、备案、域名解析、HTTPS、SMTP 配置、发布脚本、日常运维）见 **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**；
常见故障的排查方法见 **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)**。

一句话版本：

```bash
sudo bash deploy/setup-ecs.sh          # 首次：装 Node/PM2/Nginx/MongoDB
cp server/.env.example server/.env     # 填写生产配置
bash deploy/deploy.sh                  # 每次发布：拉代码 → 构建 → 测试 → PM2 重载 → Nginx 重载 → 健康检查
```

## 内容维护

- 文案、新闻、规格等内容集中在 `client/src/data/*.js`，修改后无需改动组件。
- 新增新闻：在 `client/src/data/news.js` 顶部加一条，并把图片放到 `client/public/images/`。
- 新增产品：在 `client/src/data/site.js` 的 `products` 里加一项，导航下拉会自动出现；再新建对应页面与路由。
- 品牌色等设计变量在 `client/src/styles/index.css` 的 `:root` 中。

## 与旧版的差异

| 旧版（静态站） | 新版 |
| --- | --- |
| 5 个独立 HTML，导航/页脚在每页重复 | React 组件化，共用 Layout，按数据渲染 |
| 4000 余行单一 `styles.css` | 组件级 CSS Modules + 全局设计变量 |
| EmailJS 在浏览器直接发邮件（密钥暴露在前端） | 表单提交到自有 REST API，服务端校验 / 入库 / 发信 |
| 验证码在浏览器生成、答案挂在 `window` 上 | 服务端生成、一次性核销、带有效期 |
| 询盘不留存 | 全部写入 MongoDB，可通过管理接口查询与标记状态 |
| GitHub Pages | 阿里云 ECS + Nginx + PM2，含部署与排障文档 |

## 联系方式

- 公司邮箱：puzz@inspireomni.ai
- 公司地址：北京海淀区东升大厦4楼
- 工作时间：周一至周五 9:30-18:00

© 启物科技 Inspireomni. 保留所有权利.
