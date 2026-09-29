import http from 'node:http';
import { env, assertEnv } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { createApp } from './app.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  for (const problem of assertEnv()) logger.warn(`配置提示: ${problem}`);

  const app = createApp();
  const server = http.createServer(app);

  // 先监听端口，让 /api/health 立刻可用；数据库在后台连接（失败会重试并降级运行）
  await new Promise((resolve) => server.listen(env.port, resolve));
  logger.info(`API 服务已启动: http://localhost:${env.port}/api  (env=${env.nodeEnv})`);

  connectDB().catch((error) => logger.error(`数据库连接异常: ${error.message}`));

  const shutdown = async (signal) => {
    logger.info(`收到 ${signal}，正在优雅关闭...`);
    server.close(async () => {
      await disconnectDB();
      logger.info('已关闭，再见');
      process.exit(0);
    });
    // 兜底：10 秒内没关掉就强退
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => logger.error(`未处理的 Promise 拒绝: ${reason}`));
}

bootstrap().catch((error) => {
  logger.error(`启动失败: ${error.stack || error.message}`);
  process.exit(1);
});
