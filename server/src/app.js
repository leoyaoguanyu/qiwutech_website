import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { apiLimiter } from './middleware/rateLimiters.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * 组装 Express 应用（不监听端口，方便测试直接 supertest(app)）
 */
export function createApp() {
  const app = express();

  if (env.trustProxy) app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // ---- 安全 & 基础中间件 ----
  app.use(
    helmet({
      // API 只返回 JSON；托管前端时需要放开字体/内联样式等
      contentSecurityPolicy: env.serveClient
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
              fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
              imgSrc: ["'self'", 'data:', 'blob:'],
              mediaSrc: ["'self'"],
              connectSrc: ["'self'"],
              frameAncestors: ["'none'"],
            },
          }
        : undefined,
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        // 同源请求 / 服务端调用没有 Origin；开发环境放开
        if (!origin || !env.isProduction || env.clientOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS 拒绝来源: ${origin}`));
      },
      methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'x-admin-key'],
    }),
  );

  app.use(express.json({ limit: '32kb' }));
  app.use(express.urlencoded({ extended: false, limit: '32kb' }));

  if (!env.isTest) {
    app.use(morgan(env.isProduction ? 'combined' : 'dev'));
  }

  // ---- API ----
  app.use('/api', apiLimiter, apiRouter);

  // ---- 可选：由 Express 托管前端构建产物 ----
  if (env.serveClient) {
    const clientDist = path.resolve(__dirname, '../../client/dist');
    if (fs.existsSync(clientDist)) {
      app.use(
        express.static(clientDist, {
          maxAge: '30d',
          setHeaders: (res, filePath) => {
            if (filePath.endsWith('index.html')) res.setHeader('Cache-Control', 'no-cache');
          },
        }),
      );
      // SPA 回退：非 /api 的 GET 请求都返回 index.html
      app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
      logger.info(`已启用前端静态托管: ${clientDist}`);
    } else {
      logger.warn(`SERVE_CLIENT=true 但未找到 ${clientDist}，请先执行 npm run build`);
    }
  }

  // ---- 404 & 错误处理 ----
  app.use('/api', notFound);
  app.use(errorHandler);

  return app;
}
