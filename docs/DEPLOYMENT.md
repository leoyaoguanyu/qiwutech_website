# 阿里云部署指南

目标架构（单台 ECS 即可）：

```
用户浏览器
   │  80/443
   ▼
Nginx ──── 静态文件 client/dist（React 构建产物，SPA 回退到 index.html）
   │
   │  /api/*  反向代理
   ▼
Node.js (Express, PM2 守护, 127.0.0.1:4000)
   │
   ▼
MongoDB（本机 mongod 或 阿里云 ApsaraDB for MongoDB）
   │
   └─► SMTP（阿里云邮件推送 / 企业邮箱）发送询盘通知
```

> 全文把 `your-domain.com` 换成实际域名，`/var/www/inspireomni` 为约定的部署目录。

---

## 0. 准备清单

| 项目 | 说明 |
| --- | --- |
| ECS 实例 | 推荐 Ubuntu 22.04/24.04，2 vCPU / 2 GB 起步，带公网 IP |
| 域名 | 在阿里云「域名」控制台购买或转入 |
| **ICP 备案** | 中国大陆地域 ECS 绑定域名对外提供 Web 服务**必须完成备案**，否则 80/443 会被阻断。备案周期约 1–3 周，建议最先启动 |
| SSL 证书 | 阿里云「数字证书管理服务」有免费 DV 证书（每年可申领若干张），或用 certbot |
| MongoDB | 二选一：ECS 上自建 mongod；或购买 ApsaraDB for MongoDB（推荐生产环境，自带备份/监控） |
| SMTP | 阿里云「邮件推送 DirectMail」或企业邮箱 SMTP。**注意 ECS 默认封禁 25 端口出方向，必须用 465（SSL）** |

---

## 1. 安全组

阿里云控制台 → ECS → 安全组 → 入方向规则，放通：

| 协议 | 端口 | 来源 | 用途 |
| --- | --- | --- | --- |
| TCP | 22 | 你的办公 IP（尽量不要 0.0.0.0/0） | SSH |
| TCP | 80 | 0.0.0.0/0 | HTTP |
| TCP | 443 | 0.0.0.0/0 | HTTPS |

**不要**放通 4000（Node）和 27017（MongoDB），它们只监听本机。

---

## 2. 初始化服务器

```bash
ssh root@<ECS 公网 IP>

# 建一个普通用户做部署（可选但推荐）
adduser deploy && usermod -aG sudo deploy
su - deploy

# 拉代码
sudo mkdir -p /var/www/inspireomni && sudo chown $USER:$USER /var/www/inspireomni
git clone https://github.com/<org>/<repo>.git /var/www/inspireomni
cd /var/www/inspireomni

# 一键安装 Node 22 / PM2 / Nginx / MongoDB 7 并配置 ufw
sudo bash deploy/setup-ecs.sh
# 如果使用 ApsaraDB，不需要本机 MongoDB：
# sudo INSTALL_MONGO=no bash deploy/setup-ecs.sh
```

脚本做了什么：安装 Node.js 22（NodeSource）、全局 PM2 并注册 systemd 开机自启、Nginx、（可选）MongoDB 7 仅监听 127.0.0.1、创建 `/var/log/inspireomni`、ufw 放通 22/80/443。

---

## 3. 配置环境变量

```bash
cp server/.env.example server/.env
nano server/.env
```

生产环境建议的值：

```ini
NODE_ENV=production
PORT=4000
TRUST_PROXY=true                          # 在 Nginx 后面，正确识别客户端 IP（限流依赖它）
CLIENT_ORIGINS=https://your-domain.com,https://www.your-domain.com

# 本机 MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/inspireomni
# 或 ApsaraDB（控制台 -> 实例 -> 数据库连接 复制连接串，注意把 ECS 内网 IP 加进白名单）
# MONGODB_URI=mongodb://inspireomni:<密码>@dds-xxxx.mongodb.rds.aliyuncs.com:3717/inspireomni?authSource=admin

# 阿里云邮件推送
SMTP_HOST=smtpdm.aliyun.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@mail.your-domain.com    # 邮件推送里创建的「发信地址」
SMTP_PASS=<发信地址的 SMTP 密码>
MAIL_FROM="启物科技官网 <noreply@mail.your-domain.com>"
MAIL_TO=puzz@inspireomni.ai
MAIL_AUTO_REPLY=true

ADMIN_API_KEY=<openssl rand -hex 32 生成一个长随机串>
```

> 邮件推送需先在控制台完成「发信域名」验证（添加 TXT/MX/CNAME 记录）再创建发信地址。

---

## 4. 首次发布

```bash
cd /var/www/inspireomni
bash deploy/deploy.sh
```

`deploy.sh` 依次执行：`git pull` → `npm ci` → `vite build` → 运行后端测试 → `pm2 start/reload` → 安装并重载 Nginx 配置 → `curl /api/health` 自检。任何一步失败都会中止。

首次运行后编辑 Nginx 站点文件填入域名：

```bash
sudo nano /etc/nginx/sites-available/inspireomni.conf   # 替换 your-domain.com
sudo nginx -t && sudo systemctl reload nginx
```

此时通过 `http://<ECS 公网 IP>` 应能看到网站（域名解析生效前可用 IP 验证）。

---

## 5. 域名解析

阿里云控制台 → 云解析 DNS → 你的域名 → 添加记录：

| 记录类型 | 主机记录 | 记录值 | TTL |
| --- | --- | --- | --- |
| A | `@` | ECS 公网 IP | 10 分钟 |
| A | `www` | ECS 公网 IP | 10 分钟 |

验证：`dig +short your-domain.com` 或 `nslookup your-domain.com` 返回 ECS IP。

备案通过后，还需在 ECS/域名控制台完成「备案信息接入」，否则访问会被拦截到阿里云的提示页。

---

## 6. HTTPS

### 方式 A：阿里云免费证书

1. 数字证书管理服务 → SSL 证书 → 免费证书 → 申请（域名验证选 DNS，控制台可一键添加解析）
2. 签发后下载 **Nginx** 格式，得到 `.pem` 与 `.key`
3. 上传到服务器：

```bash
sudo mkdir -p /etc/nginx/ssl
sudo cp your-domain.com.pem your-domain.com.key /etc/nginx/ssl/
sudo chmod 600 /etc/nginx/ssl/*
```

4. 编辑 `/etc/nginx/sites-available/inspireomni.conf`：取消 443 server 块注释，并把 80 块里的 `return 301 https://...` 取消注释
5. `sudo nginx -t && sudo systemctl reload nginx`

免费证书有效期 3 个月/1 年（以控制台为准），到期前需重新申请替换。

### 方式 B：certbot（Let's Encrypt，自动续期）

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

certbot 会自动改写 Nginx 配置并添加续期定时任务。

---

## 7. 日常运维

| 操作 | 命令 |
| --- | --- |
| 发布新版本 | `cd /var/www/inspireomni && bash deploy/deploy.sh` |
| 查看进程 | `pm2 status` |
| 实时日志 | `pm2 logs inspireomni-api` |
| 重启 API | `pm2 restart inspireomni-api` |
| Nginx 日志 | `sudo tail -f /var/log/nginx/inspireomni.error.log` |
| 健康检查 | `curl -s https://your-domain.com/api/health` |
| 查看询盘 | `curl -s https://your-domain.com/api/inquiries -H "x-admin-key: $ADMIN_API_KEY"` |
| 备份数据库 | `mongodump --uri="$MONGODB_URI" --out=/backup/$(date +%F)` |

建议加一个 cron 每天 `mongodump` 并同步到 OSS（`ossutil cp -r`）。使用 ApsaraDB 则在控制台开启自动备份即可。

---

## 8. 扩展说明

- **多实例 / 多机**：验证码存在进程内存里，横向扩展前先把 `server/src/services/captchaService.js` 的 `Map` 换成 Redis（阿里云 Tair/Redis），并把 PM2 `instances` 改为 `max`、`exec_mode` 改为 `cluster`。
- **前后端分离部署**：前端可以放到 OSS + CDN。此时 `client/.env` 里设置 `VITE_API_BASE_URL=https://api.your-domain.com/api`，后端 `CLIENT_ORIGINS` 填前端域名。
- **不用 Nginx**：设置 `SERVE_CLIENT=true`，Express 会直接托管 `client/dist` 并做 SPA 回退（适合 Docker 单容器）。
- **大陆访问速度**：`client/index.html` 里引用了 Google Fonts。若目标用户主要在大陆，建议删掉该链接（已配置系统中文字体回退）或把 Inter 字体文件放到 `client/public/fonts` 自托管。
- **CDN**：`/assets/*` 带内容 hash 可以永久缓存，`/video/*` 体积较大（约 24 MB），建议接入阿里云 CDN 并开启 Range 回源。

遇到问题请看 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)。
