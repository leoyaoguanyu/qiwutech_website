import mongoose from 'mongoose';
import { Inquiry, INQUIRY_STATUSES } from '../models/Inquiry.js';
import { verifyCaptcha, CAPTCHA_ERROR_MESSAGES } from '../services/captchaService.js';
import { sendInquiryNotifications } from '../services/mailService.js';
import { isDbConnected } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

const requireDb = () => {
  if (!isDbConnected()) {
    throw new ApiError(503, '服务暂时不可用，请稍后再试或直接联系 400-888-8888', { code: 'DB_UNAVAILABLE' });
  }
};

/** POST /api/inquiries —— 提交联系表单 */
export async function createInquiry(req, res, next) {
  try {
    const data = req.validated;

    // 蜜罐：机器人填了隐藏字段，假装成功但不入库、不发信
    if (data.website) {
      return res.status(201).json({ success: true, message: '提交成功' });
    }

    const captchaResult = verifyCaptcha(data.captchaToken, data.captcha);
    if (!captchaResult.ok) {
      throw new ApiError(400, CAPTCHA_ERROR_MESSAGES[captchaResult.reason], {
        code: 'CAPTCHA_INVALID',
        errors: [{ field: 'captcha', message: CAPTCHA_ERROR_MESSAGES[captchaResult.reason] }],
      });
    }

    requireDb();

    const inquiry = await Inquiry.create({
      name: data.name,
      country: data.country,
      phone: data.phone,
      email: data.email,
      company: data.company || '',
      industry: data.industry || '',
      address: data.address || '',
      content: data.content,
      meta: {
        ip: req.ip,
        userAgent: req.get('user-agent') || '',
        referer: req.get('referer') || '',
      },
    });

    // 发邮件不影响提交结果；把发送情况记到文档上便于追溯
    const notifications = await sendInquiryNotifications(inquiry);
    inquiry.notifications = notifications;
    await inquiry.save().catch((error) => logger.error(`保存邮件状态失败: ${error.message}`));

    logger.info(`新询盘 ${inquiry.id} 来自 ${inquiry.email}`);

    return res.status(201).json({
      success: true,
      message: '消息发送成功！我们已收到您的咨询，会在 1-2 个工作日内回复您。',
      data: {
        id: inquiry.id,
        createdAt: inquiry.createdAt,
        emailSent: notifications.company.sent,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/** GET /api/inquiries?page=1&limit=20&status=new —— 管理端列表 */
export async function listInquiries(req, res, next) {
  try {
    requireDb();

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const filter = {};
    if (req.query.status) {
      if (!INQUIRY_STATUSES.includes(req.query.status)) {
        throw new ApiError(400, `status 只能是 ${INQUIRY_STATUSES.join(' / ')}`, { code: 'INVALID_STATUS' });
      }
      filter.status = req.query.status;
    }

    const [items, total] = await Promise.all([
      Inquiry.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Inquiry.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
}

/** GET /api/inquiries/:id */
export async function getInquiry(req, res, next) {
  try {
    requireDb();
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(404, '询盘不存在', { code: 'NOT_FOUND' });
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) throw new ApiError(404, '询盘不存在', { code: 'NOT_FOUND' });
    return res.json({ success: true, data: inquiry });
  } catch (error) {
    return next(error);
  }
}

/** PATCH /api/inquiries/:id —— 更新处理状态 */
export async function updateInquiryStatus(req, res, next) {
  try {
    requireDb();
    const { status } = req.body || {};
    if (!INQUIRY_STATUSES.includes(status)) {
      throw new ApiError(400, `status 只能是 ${INQUIRY_STATUSES.join(' / ')}`, { code: 'INVALID_STATUS' });
    }
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(404, '询盘不存在', { code: 'NOT_FOUND' });
    const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!inquiry) throw new ApiError(404, '询盘不存在', { code: 'NOT_FOUND' });
    return res.json({ success: true, data: inquiry });
  } catch (error) {
    return next(error);
  }
}
