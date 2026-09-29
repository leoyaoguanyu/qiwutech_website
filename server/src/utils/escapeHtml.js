const MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** 邮件模板里插入用户输入前先转义，防止 HTML 注入 */
export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => MAP[ch]);
