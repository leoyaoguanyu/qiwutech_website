import { Router } from 'express';
import { getCaptcha } from '../controllers/captchaController.js';
import { captchaLimiter } from '../middleware/rateLimiters.js';

const router = Router();

router.get('/', captchaLimiter, getCaptcha);

export default router;
