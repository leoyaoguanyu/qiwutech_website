#!/usr/bin/env bash
# ============================================================
# 阿里云 ECS 首次初始化脚本（Ubuntu 22.04 / 24.04）
# 用法：sudo bash deploy/setup-ecs.sh
# 完成：Node.js 22 + PM2 + Nginx + (可选) MongoDB 7 + 目录 & 日志
# 之后按 docs/DEPLOYMENT.md 继续
# ============================================================
set -euo pipefail

APP_DIR=/var/www/inspireomni
LOG_DIR=/var/log/inspireomni
DEPLOY_USER=${SUDO_USER:-$USER}
INSTALL_MONGO=${INSTALL_MONGO:-yes}   # 使用阿里云 ApsaraDB 时设为 no

echo "==> 更新系统包"
apt-get update -y && apt-get upgrade -y
apt-get install -y curl git nginx ufw gnupg ca-certificates

echo "==> 安装 Node.js 22 (NodeSource)"
if ! command -v node >/dev/null || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
node -v && npm -v

echo "==> 安装 PM2"
npm install -g pm2
pm2 startup systemd -u "$DEPLOY_USER" --hp "/home/$DEPLOY_USER" >/dev/null || true

if [[ "$INSTALL_MONGO" == "yes" ]]; then
  echo "==> 安装 MongoDB 7（仅监听本机）"
  if ! command -v mongod >/dev/null; then
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
    . /etc/os-release
    echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu ${VERSION_CODENAME}/mongodb-org/7.0 multiverse" \
      > /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update -y && apt-get install -y mongodb-org
    systemctl enable --now mongod
  fi
  systemctl is-active mongod
fi

echo "==> 创建目录"
mkdir -p "$APP_DIR" "$LOG_DIR"
chown -R "$DEPLOY_USER":"$DEPLOY_USER" "$APP_DIR" "$LOG_DIR"

echo "==> 配置防火墙（同时记得在阿里云控制台安全组放通 22/80/443）"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> 完成。下一步："
echo "   1. su - $DEPLOY_USER && git clone <repo> $APP_DIR"
echo "   2. cp $APP_DIR/server/.env.example $APP_DIR/server/.env 并填写"
echo "   3. bash $APP_DIR/deploy/deploy.sh"
