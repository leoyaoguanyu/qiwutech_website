import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { escapeHtml } from '../utils/escapeHtml.js';

let transporter;

/**
 * 懒加载 SMTP 连接。
 * 未配置 SMTP_HOST 时使用 nodemailer 的 jsonTransport：不真正发信，
 * 只把邮件内容以 JSON 返回并写日志，方便本地开发与测试。
 */
export function getTransporter() {
  if (transporter) return transporter;

  if (env.smtp.host) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    });
  } else {
    if (!env.isTest) logger.warn('未配置 SMTP_HOST，邮件将只打印到日志而不会真正发送');
    transporter = nodemailer.createTransport({ jsonTransport: true });
  }
  return transporter;
}

/** 测试时可注入假 transporter */
export function setTransporterForTest(fake) {
  transporter = fake;
}

const formatDate = (date) =>
  new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Shanghai',
  }).format(date);

function buildCompanyEmail(inquiry) {
  const rows = [
    ['姓名', inquiry.name],
    ['国家/地区', inquiry.country],
    ['联系方式', inquiry.phone],
    ['邮箱', inquiry.email],
    ['公司', inquiry.company || '—'],
    ['应用行业', inquiry.industry || '未选择'],
    ['联系地址', inquiry.address || '—'],
    ['提交时间', formatDate(inquiry.createdAt || new Date())],
  ]
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;background:#f8fafc;font-weight:600;white-space:nowrap">${label}</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${escapeHtml(value)}</td></tr>`,
    )
    .join('');

  const subject = `【官网询盘】${inquiry.name}${inquiry.company ? ` - ${inquiry.company}` : ''}${inquiry.industry ? `（${inquiry.industry}）` : ''}`;

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'PingFang SC','Microsoft YaHei',sans-serif;max-width:640px;margin:0 auto;color:#1f2937">
      <h2 style="color:#8b5cf6;margin-bottom:4px">新的官网询盘</h2>
      <p style="color:#6b7280;margin-top:0">来自启物科技官网「联系我们」表单</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0">${rows}</table>
      <h3 style="margin-bottom:8px">咨询内容</h3>
      <div style="padding:12px 16px;border-left:4px solid #8b5cf6;background:#f3f4f6;white-space:pre-wrap;line-height:1.6">${escapeHtml(inquiry.content)}</div>
      <p style="color:#9ca3af;font-size:12px;margin-top:24px">询盘编号：${inquiry.id ?? inquiry._id ?? ''}</p>
    </div>`;

  const text = [
    '新的官网询盘',
    `姓名：${inquiry.name}`,
    `国家/地区：${inquiry.country}`,
    `联系方式：${inquiry.phone}`,
    `邮箱：${inquiry.email}`,
    `公司：${inquiry.company || '—'}`,
    `应用行业：${inquiry.industry || '未选择'}`,
    `联系地址：${inquiry.address || '—'}`,
    '',
    '咨询内容：',
    inquiry.content,
  ].join('\n');

  return { subject, html, text };
}

function buildAutoReplyEmail(inquiry) {
  const subject = '感谢您联系启物科技 InspireOmni';
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'PingFang SC','Microsoft YaHei',sans-serif;max-width:640px;margin:0 auto;color:#1f2937;line-height:1.7">
      <h2 style="color:#8b5cf6">${escapeHtml(inquiry.name)}，您好！</h2>
      <p>我们已经收到您的咨询，会在 <strong>1–2 个工作日</strong>内与您联系。</p>
      <p>以下是您提交的内容：</p>
      <div style="padding:12px 16px;border-left:4px solid #8b5cf6;background:#f3f4f6;white-space:pre-wrap">${escapeHtml(inquiry.content)}</div>
      <p>如有紧急需求，欢迎直接致电 <strong>400-888-8888</strong>。</p>
      <p style="margin-top:32px">启物科技 InspireOmni<br/><span style="color:#6b7280">北京海淀区东升大厦4楼 · 周一至周五 9:30-18:00</span></p>
    </div>`;
  const text = `${inquiry.name}，您好！\n\n我们已经收到您的咨询，会在 1–2 个工作日内与您联系。\n\n您提交的内容：\n${inquiry.content}\n\n如有紧急需求，欢迎直接致电 400-888-8888。\n\n启物科技 InspireOmni`;
  return { subject, html, text };
}

async function trySend(mailOptions) {
  try {
    const info = await getTransporter().sendMail(mailOptions);
    if (info?.message && !env.isTest) {
      logger.info(`[mail:dry-run] ${mailOptions.subject} -> ${mailOptions.to}`);
    }
    return { sent: true, sentAt: new Date() };
  } catch (error) {
    logger.error(`邮件发送失败 (${mailOptions.subject}): ${error.message}`);
    return { sent: false, error: error.message };
  }
}

/**
 * 发送两封邮件：通知公司 + 自动回复用户。
 * 两封互不影响，任一失败都不会让询盘提交失败，结果会记录到询盘文档里。
 */
export async function sendInquiryNotifications(inquiry) {
  const tasks = [];

  if (env.mail.to.length > 0) {
    const company = buildCompanyEmail(inquiry);
    tasks.push(
      trySend({
        from: env.mail.from,
        to: env.mail.to.join(', '),
        replyTo: inquiry.email,
        ...company,
      }).then((result) => ['company', result]),
    );
  } else {
    tasks.push(Promise.resolve(['company', { sent: false, error: 'MAIL_TO 未配置' }]));
  }

  if (env.mail.autoReply) {
    const reply = buildAutoReplyEmail(inquiry);
    tasks.push(
      trySend({ from: env.mail.from, to: inquiry.email, ...reply }).then((result) => ['autoReply', result]),
    );
  } else {
    tasks.push(Promise.resolve(['autoReply', { sent: false, error: '自动回复已关闭' }]));
  }

  return Object.fromEntries(await Promise.all(tasks));
}
