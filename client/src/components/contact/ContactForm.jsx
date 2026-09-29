import { useCallback, useRef, useState } from 'react';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { INDUSTRIES, INQUIRY_LIMITS } from '@inspireomni/shared';
import { submitInquiry, ApiError } from '../../services/api.js';
import Button from '../ui/Button.jsx';
import FormField from './FormField.jsx';
import Captcha from './Captcha.jsx';
import styles from './ContactForm.module.css';

const INITIAL_VALUES = {
  name: '',
  country: '',
  phone: '',
  company: '',
  email: '',
  industry: '',
  address: '',
  content: '',
  captcha: '',
  website: '', // 蜜罐：真人看不到这个字段
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+\-\s()]+$/;

/** 前端先做一轮即时校验，规则与后端 shared 常量保持一致 */
function validate(values) {
  const errors = {};
  const L = INQUIRY_LIMITS;

  if (!values.name.trim()) errors.name = '请输入您的姓名';
  else if (values.name.trim().length > L.name.max) errors.name = `姓名不能超过 ${L.name.max} 个字符`;

  if (!values.country.trim()) errors.country = '请填写所属国家或地区';

  if (!values.phone.trim()) errors.phone = '请输入联系方式';
  else if (!PHONE_PATTERN.test(values.phone.trim()) || values.phone.trim().length < L.phone.min)
    errors.phone = '请输入有效的手机号或电话';

  if (!values.email.trim()) errors.email = '请输入邮箱地址';
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = '请输入有效的邮箱地址';

  if (values.company.length > L.company.max) errors.company = `公司名称不能超过 ${L.company.max} 个字符`;
  if (values.address.length > L.address.max) errors.address = `联系地址不能超过 ${L.address.max} 个字符`;

  if (!values.content.trim()) errors.content = '请填写咨询内容';
  else if (values.content.trim().length < L.content.min) errors.content = `内容至少 ${L.content.min} 个字符`;
  else if (values.content.length > L.content.max) errors.content = `内容不能超过 ${L.content.max} 个字符`;

  if (values.captcha.trim().length !== L.captcha.length) errors.captcha = `请输入 ${L.captcha.length} 位验证码`;

  return errors;
}

export default function ContactForm({ disclaimer }) {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaKey, setCaptchaKey] = useState(0);
  const formRef = useRef(null);

  const submitting = status.type === 'submitting';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleTokenChange = useCallback((token) => setCaptchaToken(token), []);

  const focusFirstError = (errorMap) => {
    const first = Object.keys(errorMap).find((key) => errorMap[key]);
    if (first) formRef.current?.querySelector(`[name="${first}"]`)?.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const clientErrors = validate(values);
    if (!captchaToken) clientErrors.captcha = '验证码尚未加载，请刷新验证码';
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      focusFirstError(clientErrors);
      return;
    }

    setStatus({ type: 'submitting', message: '' });
    setErrors({});

    try {
      const result = await submitInquiry({
        ...values,
        name: values.name.trim(),
        country: values.country.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        content: values.content.trim(),
        captchaToken,
      });
      setStatus({ type: 'success', message: result.message || '消息发送成功！我们已收到您的咨询，会在 1-2 个工作日内回复您。' });
      setValues(INITIAL_VALUES);
      setCaptchaKey((key) => key + 1);
    } catch (error) {
      const isApiError = error instanceof ApiError;
      const fieldErrors = isApiError ? error.fieldErrors : {};
      setErrors(fieldErrors);
      setStatus({
        type: 'error',
        message: isApiError ? error.message : '发送失败，请稍后重试或直接联系我们：400-888-8888',
      });
      // 验证码相关错误 -> 换一张
      if (!isApiError || error.code === 'CAPTCHA_INVALID' || fieldErrors.captcha) {
        setValues((prev) => ({ ...prev, captcha: '' }));
        setCaptchaKey((key) => key + 1);
      }
      focusFirstError(fieldErrors);
    }
  };

  return (
    <form ref={formRef} className={styles.form} onSubmit={handleSubmit} noValidate>
      {/* 第一行：姓名、国家/地区、联系方式 */}
      <div className={styles.row}>
        <FormField id="name" label="姓名" required error={errors.name}>
          <input id="name" name="name" type="text" placeholder="请输入您的姓名" value={values.name} onChange={handleChange} disabled={submitting} autoComplete="name" required />
        </FormField>
        <FormField id="country" label="国家/地区" required error={errors.country}>
          <input id="country" name="country" type="text" placeholder="所属国家或地区" value={values.country} onChange={handleChange} disabled={submitting} autoComplete="country-name" required />
        </FormField>
        <FormField id="phone" label="联系方式" required error={errors.phone}>
          <input id="phone" name="phone" type="tel" placeholder="请输入手机号" value={values.phone} onChange={handleChange} disabled={submitting} autoComplete="tel" required />
        </FormField>
      </div>

      {/* 第二行：公司、邮箱、应用行业 */}
      <div className={styles.row}>
        <FormField id="company" label="公司" error={errors.company}>
          <input id="company" name="company" type="text" placeholder="请输入公司名称" value={values.company} onChange={handleChange} disabled={submitting} autoComplete="organization" />
        </FormField>
        <FormField id="email" label="邮箱" required error={errors.email}>
          <input id="email" name="email" type="email" placeholder="请输入邮箱地址" value={values.email} onChange={handleChange} disabled={submitting} autoComplete="email" required />
        </FormField>
        <FormField id="industry" label="应用行业" error={errors.industry}>
          <select id="industry" name="industry" value={values.industry} onChange={handleChange} disabled={submitting}>
            <option value="">请选择应用行业</option>
            {INDUSTRIES.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      {/* 第三行：联系地址 */}
      <FormField id="address" label="联系地址" error={errors.address}>
        <input id="address" name="address" type="text" placeholder="请输入您的联系地址" value={values.address} onChange={handleChange} disabled={submitting} autoComplete="street-address" />
      </FormField>

      {/* 第四行：内容 */}
      <FormField id="content" label="内容" required error={errors.content}>
        <textarea id="content" name="content" rows={5} placeholder="所填内容请务必包含产品名称或型号" value={values.content} onChange={handleChange} disabled={submitting} maxLength={INQUIRY_LIMITS.content.max} required />
      </FormField>

      {/* 第五行：验证码 */}
      <FormField id="captcha" label="验证码" required error={errors.captcha} className={styles.captchaField}>
        <Captcha id="captcha" value={values.captcha} onChange={handleChange} onTokenChange={handleTokenChange} refreshKey={captchaKey} disabled={submitting} hasError={Boolean(errors.captcha)} />
      </FormField>

      {/* 蜜罐字段（隐藏） */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="website">网站</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={handleChange} />
      </div>

      {disclaimer && (
        <div className={styles.disclaimer}>
          <p>{disclaimer}</p>
        </div>
      )}

      {status.type === 'success' && (
        <p className={`${styles.status} ${styles.success}`} role="status">
          <FaCheckCircle aria-hidden="true" /> {status.message}
        </p>
      )}
      {status.type === 'error' && (
        <p className={`${styles.status} ${styles.failure}`} role="alert">
          <FaExclamationTriangle aria-hidden="true" /> {status.message}
        </p>
      )}

      <Button type="submit" variant="primary" pill disabled={submitting} aria-busy={submitting}>
        {submitting ? '发送中...' : '联系销售'}
      </Button>
    </form>
  );
}
