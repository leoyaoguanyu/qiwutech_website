import mongoose from 'mongoose';
import { INDUSTRIES, INQUIRY_LIMITS } from '@inspireomni/shared';

export const INQUIRY_STATUSES = ['new', 'contacted', 'closed'];

const notificationSchema = new mongoose.Schema(
  {
    sent: { type: Boolean, default: false },
    sentAt: Date,
    error: String,
  },
  { _id: false },
);

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: INQUIRY_LIMITS.name.max },
    country: { type: String, required: true, trim: true, maxlength: INQUIRY_LIMITS.country.max },
    phone: { type: String, required: true, trim: true, maxlength: INQUIRY_LIMITS.phone.max },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: INQUIRY_LIMITS.email.max },
    company: { type: String, trim: true, maxlength: INQUIRY_LIMITS.company.max, default: '' },
    industry: { type: String, enum: [...INDUSTRIES, ''], default: '' },
    address: { type: String, trim: true, maxlength: INQUIRY_LIMITS.address.max, default: '' },
    content: { type: String, required: true, trim: true, maxlength: INQUIRY_LIMITS.content.max },

    status: { type: String, enum: INQUIRY_STATUSES, default: 'new', index: true },
    notifications: {
      company: { type: notificationSchema, default: () => ({}) },
      autoReply: { type: notificationSchema, default: () => ({}) },
    },
    meta: {
      ip: String,
      userAgent: String,
      referer: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

inquirySchema.index({ createdAt: -1 });

/** 对外输出时隐藏内部字段 */
inquirySchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export const Inquiry = mongoose.model('Inquiry', inquirySchema);
