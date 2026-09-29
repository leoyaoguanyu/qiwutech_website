import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 连接 MongoDB，失败后按间隔重试。
 * 连接失败不会让进程退出：API 仍可提供健康检查与验证码，
 * 需要数据库的接口会返回 503，方便运维排查。
 */
export async function connectDB(uri = env.mongoUri, { retries = 5, delayMs = 3000 } = {}) {
  mongoose.set('strictQuery', true);

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      logger.info(`MongoDB 已连接: ${mongoose.connection.host}/${mongoose.connection.name}`);
      return mongoose.connection;
    } catch (error) {
      logger.error(`MongoDB 连接失败 (第 ${attempt}/${retries} 次): ${error.message}`);
      if (attempt < retries) await sleep(delayMs);
    }
  }

  logger.error('MongoDB 多次连接失败，服务将以降级模式运行（数据库相关接口返回 503）');
  return null;
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

// 只在曾经成功连接过之后才提示「断开」，避免启动重试阶段刷屏
let hasConnected = false;
mongoose.connection.on('connected', () => {
  hasConnected = true;
});
mongoose.connection.on('disconnected', () => {
  if (hasConnected) logger.warn('MongoDB 连接已断开，等待自动重连...');
});
mongoose.connection.on('reconnected', () => logger.info('MongoDB 已重新连接'));
