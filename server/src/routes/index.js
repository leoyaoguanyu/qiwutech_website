import { Router } from 'express';
import healthRouter from './health.js';
import captchaRouter from './captcha.js';
import inquiriesRouter from './inquiries.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/captcha', captchaRouter);
router.use('/inquiries', inquiriesRouter);

export default router;
