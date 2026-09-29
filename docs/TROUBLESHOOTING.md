# 故障排查手册

按「现象 → 排查 → 处理」整理，先看 [快速定位](#快速定位) 判断出问题的是哪一层。

## 快速定位

```bash
# 1. Node API 活着吗？
pm2 status
curl -s http://127.0.0.1:4000/api/health
#   {"status":"ok","database":"connected",...}  -> API 与数据库正常
#   {"status":"degraded","database":"disconnected"} -> 看 MongoDB 章节
#   连接被拒绝 -> API 没起来，pm2 logs inspireomni-api

# 2. Nginx 正常吗？
sudo nginx -t && systemctl status nginx
curl -sI http://127.0.0.1/            # 应返回 200 + text/html
curl -s  http://127.0.0.1/api/health  # 应与第 1 步结果一致

# 3. 外网到得了吗？
curl -sI http://<公网 IP>/            # 不通 -> 安全组 / ufw / 备案
dig +short your-domain.com            # 不是 ECS IP -> DNS
```

---

## 一、前端

### 直接刷新 `/about` 等子页面 404

**原因**：SPA 路由由前端处理，服务器上并没有 `about` 这个文件。
**处理**：Nginx 的 `location /` 必须有 `try_files $uri $uri/ /index.html;`（见 `deploy/nginx/inspireomni-site.conf`）。使用 `SERVE_CLIENT=true` 时 Express 已内置回退。

### 页面白屏 / 控制台报 `Failed to load module script`

- `client/dist` 不存在或过期 → 重新 `npm run build -w client`
- Nginx `root` 路径不对 → 确认指向 `/var/www/inspireomni/client/dist`
- 部署到子路径（如 `/site/`）→ `vite.config.js` 设置 `base: '/site/'`

### 样式正常但图片 / 视频 404

图片位于 `client/public/images`，构建后原样复制到 `dist/images`。检查大小写（Linux 区分大小写，`O1.jpg` ≠ `o1.jpg`）。

### 视频无法拖动进度条 / 一直缓冲

24 MB 的 webm 需要 Range 请求支持。Nginx 默认支持；若经过 CDN 需开启「Range 回源」。开发环境 Vite 也支持。iOS Safari 不支持 webm，需要额外提供 mp4（`ffmpeg -i videodemo1.webm -c:v libx264 -crf 23 videodemo1.mp4`，然后在 `client/src/data/o1.js` 里增加一个 source）。

### 字体加载慢（大陆）

`index.html` 引用了 Google Fonts。可直接删除该 `<link>`，CSS 已回退到 PingFang / 微软雅黑；或自托管字体文件。

### 表单提示「网络连接失败」

浏览器 Network 面板看 `/api/...` 请求：

- **404 且返回 HTML** → Nginx 没有把 `/api/` 代理到 Node，检查 `location /api/`
- **502 Bad Gateway** → Node 没起来或端口不对，见 [API 502](#nginx-502-bad-gateway)
- **CORS 错误** → 前后端不同域，后端 `CLIENT_ORIGINS` 没包含前端地址（需含协议、不带末尾斜杠）
- 开发环境 → 确认 `npm run dev` 同时起了 server；Vite 代理目标默认 `http://localhost:4000`

---

## 二、Node API

### `pm2 status` 显示 errored / 反复重启

```bash
pm2 logs inspireomni-api --lines 100
```

常见原因：

| 日志关键字 | 原因 | 处理 |
| --- | --- | --- |
| `EADDRINUSE` | 4000 被占用 | `sudo lsof -i :4000` 找到进程；或改 `PORT` 并同步 Nginx upstream |
| `Cannot find package` | 依赖未安装 / 装在错误目录 | 在仓库根目录 `npm ci`（workspaces 会统一安装到根 `node_modules`） |
| `MONGODB_URI 未设置` | `.env` 缺失 | `cp server/.env.example server/.env` 并填写 |
| `ERR_MODULE_NOT_FOUND ... @inspireomni/shared` | 根目录没执行安装 | 同上，在根目录 `npm ci` |

> macOS 本地开发注意：系统「隔空播放接收器」默认占用 5000 端口，本项目因此默认使用 4000。

### Nginx 502 Bad Gateway

Nginx 连不上 Node：

1. `curl http://127.0.0.1:4000/api/health` 通不通
2. 通 → Nginx `upstream` 端口写错；不通 → `pm2 restart inspireomni-api` 并看日志
3. `sudo tail -f /var/log/nginx/inspireomni.error.log` 会有 `connect() failed (111: Connection refused)`

### 429 Too Many Requests

触发限流（提交表单每 IP 每小时 10 次）。如果所有用户都被限，通常是 `TRUST_PROXY` 没设为 `true`，Node 把所有请求都识别成 Nginx 的 127.0.0.1。设置后 `pm2 restart`。

### 提交表单返回 503 `DB_UNAVAILABLE`

见下节 MongoDB。

### 验证码总是「已失效」

- 提交前后端重启过（验证码存在内存里）→ 正常现象，刷新验证码即可
- PM2 开了多实例 → 请求落到不同进程，必须 `instances: 1` 或改 Redis
- 验证码有效期 `CAPTCHA_TTL_MS` 过短

---

## 三、MongoDB

### 健康检查 `database: disconnected`

```bash
# 本机 mongod
systemctl status mongod
sudo tail -n 50 /var/log/mongodb/mongod.log
mongosh --eval 'db.runCommand({ ping: 1 })'
```

| 现象 | 处理 |
| --- | --- |
| `mongod` 未运行 | `sudo systemctl start mongod && sudo systemctl enable mongod` |
| 磁盘满导致 mongod 退出 | `df -h`，清理日志 / 扩容 |
| `Authentication failed` | 检查 `MONGODB_URI` 用户名密码，以及 `authSource=admin` |
| ApsaraDB 连接超时 | 控制台 → 实例 → 白名单，加入 ECS **内网** IP；使用**内网**连接地址 |
| 连接串含 `@`、`#` 等特殊字符密码 | URL 编码（`@` → `%40`） |

API 启动时会重试 5 次（每次间隔 3 秒），之后进入降级模式；MongoDB 恢复后 mongoose 会自动重连，无需重启 API。

### 想看看收到的询盘

```bash
mongosh inspireomni --eval 'db.inquiries.find().sort({createdAt:-1}).limit(5).pretty()'
# 或通过管理接口
curl -s http://127.0.0.1:4000/api/inquiries -H "x-admin-key: $ADMIN_API_KEY" | jq
```

---

## 四、邮件

### 提交成功但公司没收到邮件

先查询盘记录里的发送状态：

```bash
curl -s http://127.0.0.1:4000/api/inquiries?limit=1 -H "x-admin-key: $ADMIN_API_KEY" | jq '.data[0].notifications'
```

`error` 字段会给出 SMTP 返回的原因：

| error 关键字 | 原因 | 处理 |
| --- | --- | --- |
| `ETIMEDOUT` / `ECONNECTION` 且端口 25 | **阿里云 ECS 默认封禁 25 端口出方向** | 改用 `SMTP_PORT=465` + `SMTP_SECURE=true` |
| `535 Authentication failed` | 账号密码错误 | 邮件推送用的是「发信地址」和「SMTP 密码」，不是阿里云账号密码 |
| `553 Mail from must equal authorized user` | `MAIL_FROM` 与登录账号不一致 | 两者保持一致 |
| `MAIL_TO 未配置` | `.env` 没填收件人 | 填写 `MAIL_TO` |
| 日志里有 `[mail:dry-run]` | `SMTP_HOST` 为空，处于开发模式 | 填写 SMTP 配置 |

手动测试 SMTP 连通性：

```bash
openssl s_client -connect smtpdm.aliyun.com:465 -quiet
```

### 用户没收到自动回复

多半进了垃圾箱。为发信域名配置 SPF / DKIM / DMARC（邮件推送控制台会给出记录值），可显著提高送达率。也可用 `MAIL_AUTO_REPLY=false` 关掉自动回复。

---

## 五、网络与域名

| 现象 | 排查 |
| --- | --- |
| 公网 IP 都打不开 | 安全组入方向是否放通 80/443；`sudo ufw status`；`systemctl status nginx` |
| IP 能开、域名不能 | `dig +short your-domain.com` 是否指向 ECS；DNS 修改后等 TTL 生效 |
| 域名打开是阿里云「未备案」提示页 | 备案未完成或未接入，完成备案后等待生效 |
| HTTPS 证书报错 | `sudo nginx -t`；证书与私钥是否配对：`openssl x509 -noout -modulus -in cert.pem | md5sum` 与 `openssl rsa -noout -modulus -in key.key | md5sum` 一致 |
| 混合内容警告 | 前端请求写了 `http://` 绝对地址，改用相对路径 `/api` |

---

## 六、发布脚本 `deploy.sh` 失败

| 步骤 | 常见原因 |
| --- | --- |
| `git pull --ff-only` 失败 | 服务器上有本地改动：`git stash` 或 `git reset --hard origin/main` |
| `npm ci` 失败 | `package-lock.json` 与 `package.json` 不同步，本地 `npm install` 后提交 lock 文件；Node 版本 < 20 |
| 测试失败 | `mongodb-memory-server` 首次运行需下载 mongod 二进制（约 100 MB），服务器下载慢可设置镜像 `MONGOMS_DOWNLOAD_MIRROR=https://npmmirror.com/mirrors/mongodb`，或跳过测试：`SKIP_TESTS=1 bash deploy/deploy.sh` |
| Nginx 步骤被跳过 | 当前用户无免密 sudo，手动执行脚本里的 `install` / `nginx -t` / `reload` |

---

## 七、本地开发常见问题

- **`npm run dev` 只起了前端**：确认在仓库根目录执行，根 `package.json` 用 `concurrently` 同时启动两端。
- **本地没有 MongoDB**：`docker compose up -d mongo`；或临时接受降级模式（除提交表单外一切正常）。
- **改了 `shared/` 没生效**：nodemon 已监听 `../shared/src`；Vite 端刷新页面即可。
- **端口冲突**：改 `server/.env` 的 `PORT`，同时改 `client/vite.config.js` 的代理目标或设置 `VITE_DEV_API_TARGET`。
