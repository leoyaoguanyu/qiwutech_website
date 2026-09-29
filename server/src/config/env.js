import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// 始终从 server/.env 读取，不受启动时 cwd 影响
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const toBool = (value, fallback = false) => {
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const toList = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const nodeEnv = process.env.NODE_ENV || 'development';

export const env = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
  port: toInt(process.env.PORT, 4000),
  clientOrigins: toList(process.env.CLIENT_ORIGINS),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/inspireomni',
  trustProxy: toBool(process.env.TRUST_PROXY, false),
  serveClient: toBool(process.env.SERVE_CLIENT, false),
  adminApiKey: process.env.ADMIN_API_KEY || '',
  captchaTtlMs: toInt(process.env.CAPTCHA_TTL_MS, 5 * 60 * 1000),
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: toInt(process.env.SMTP_PORT, 465),
    secure: toBool(process.env.SMTP_SECURE, true),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  mail: {
    from: process.env.MAIL_FROM || '启物科技官网 <noreply@localhost>',
    to: toList(process.env.MAIL_TO),
    autoReply: toBool(process.env.MAIL_AUTO_REPLY, true),
  },
};

/** 启动时检查关键配置，缺失时给出明确提示而不是运行到一半报错 */
export function assertEnv() {
  const problems = [];
  if (!env.mongoUri) problems.push('MONGODB_URI 未设置');
  if (env.isProduction) {
    if (!env.smtp.host) problems.push('生产环境建议设置 SMTP_HOST，否则不会发送邮件通知');
    if (env.mail.to.length === 0) problems.push('MAIL_TO 未设置，询盘通知没有接收人');
  }
  return problems;
}
