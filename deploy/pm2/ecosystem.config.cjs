/**
 * PM2 进程配置
 * 启动：pm2 start deploy/pm2/ecosystem.config.cjs --env production
 * 注意：验证码保存在进程内存中，instances 必须为 1；
 *       如需多实例 / 多机部署，请先把 captchaService 改为 Redis 存储。
 */
module.exports = {
  apps: [
    {
      name: 'inspireomni-api',
      cwd: __dirname + '/../../server',
      script: 'src/index.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
        TRUST_PROXY: 'true',
      },
      out_file: '/var/log/inspireomni/api.out.log',
      error_file: '/var/log/inspireomni/api.err.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      kill_timeout: 10000,
    },
  ],
};
