import { Router } from 'express';
import { createInquiryRules, validate } from '../validators/inquiryValidator.js';
import { createInquiry, listInquiries, getInquiry, updateInquiryStatus } from '../controllers/inquiryController.js';
import { inquiryLimiter } from '../middleware/rateLimiters.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = Router();

// 公开：提交联系表单
router.post('/', inquiryLimiter, createInquiryRules, validate, createInquiry);

// 管理端：查看 / 处理询盘
router.get('/', adminAuth, listInquiries);
router.get('/:id', adminAuth, getInquiry);
router.patch('/:id', adminAuth, updateInquiryStatus);

export default router;
