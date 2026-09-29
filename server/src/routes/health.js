import { Router } from 'express';
import { isDbConnected } from '../config/db.js';

const router = Router();

/** GET /api/health —— 供负载均衡 / 运维探测 */
router.get('/', (_req, res) => {
  const dbOk = isDbConnected();
  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? 'ok' : 'degraded',
    database: dbOk ? 'connected' : 'disconnected',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

export default router;
