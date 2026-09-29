#!/usr/bin/env bash
# ============================================================
# 发布脚本：拉代码 -> 安装依赖 -> 构建前端 -> 重启 API -> 重载 Nginx
# 用法（在服务器上）：bash deploy/deploy.sh [git分支，默认 main]
# 幂等，可重复执行
# ============================================================
set -euo pipefail

BRANCH=${1:-main}
APP_DIR=$(cd "$(dirname "$0")/.." && pwd)
NGINX_SITE=/etc/nginx/sites-available/inspireomni.conf
NGINX_SNIPPET=/etc/nginx/snippets/inspireomni-site.conf

cd "$APP_DIR"
echo "==> 目录: $APP_DIR  分支: $BRANCH"

if [[ -d .git ]]; then
  echo "==> 拉取最新代码"
  git fetch --all --prune
  git checkout "$BRANCH"
  git pull --ff-only origin "$BRANCH"
fi

if [[ ! -f server/.env ]]; then
  echo "!! 缺少 server/.env，请先 cp server/.env.example server/.env 并填写" >&2
  exit 1
fi

echo "==> 安装依赖（含 devDependencies，前端构建需要 vite）"
npm ci --no-audit --no-fund

echo "==> 构建前端"
npm run build -w client

if [[ "${SKIP_TESTS:-0}" == "1" ]]; then
  echo "==> 跳过后端测试 (SKIP_TESTS=1)"
else
  echo "==> 后端自检（测试）"
  npm test -w server || { echo "!! 测试未通过，终止发布" >&2; exit 1; }
fi

echo "==> 启动 / 重载 API (PM2)"
if pm2 describe inspireomni-api >/dev/null 2>&1; then
  pm2 reload deploy/pm2/ecosystem.config.cjs --env production --update-env
else
  pm2 start deploy/pm2/ecosystem.config.cjs --env production
fi
pm2 save

echo "==> 同步 Nginx 配置"
if [[ -w /etc/nginx ]] || sudo -n true 2>/dev/null; then
  sudo install -m 644 deploy/nginx/inspireomni-site.conf "$NGINX_SNIPPET"
  if [[ ! -f "$NGINX_SITE" ]]; then
    sudo install -m 644 deploy/nginx/inspireomni.conf "$NGINX_SITE"
    sudo ln -sf "$NGINX_SITE" /etc/nginx/sites-enabled/inspireomni.conf
    sudo rm -f /etc/nginx/sites-enabled/default
    echo "   已安装站点配置，请编辑 $NGINX_SITE 填入域名与证书路径"
  fi
  sudo nginx -t && sudo systemctl reload nginx
else
  echo "   (无 sudo 权限，跳过 Nginx 配置同步)"
fi

echo "==> 健康检查"
sleep 2
curl -fsS http://127.0.0.1:4000/api/health && echo || { echo "!! API 健康检查失败，查看: pm2 logs inspireomni-api" >&2; exit 1; }

echo "==> 发布完成 ✅"
