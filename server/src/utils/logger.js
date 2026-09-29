/** 极简日志封装：统一前缀与时间戳，测试环境静音 */
const silent = process.env.NODE_ENV === 'test' && !process.env.DEBUG_LOGS;

const format = (level, message) => `[${new Date().toISOString()}] [${level}] ${message}`;

export const logger = {
  info: (message) => !silent && console.log(format('INFO', message)),
  warn: (message) => !silent && console.warn(format('WARN', message)),
  error: (message) => !silent && console.error(format('ERROR', message)),
};
