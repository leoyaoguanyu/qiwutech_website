import { useCallback, useEffect, useState } from 'react';
import { FaSyncAlt } from 'react-icons/fa';
import { fetchCaptcha } from '../../services/api.js';
import styles from './Captcha.module.css';

/**
 * 服务端图形验证码。
 * 拿到 token 后通过 onTokenChange 交给表单，提交时一起发给后端校验。
 * refreshKey 变化时（例如提交成功 / 验证码错误）自动刷新。
 */
export default function Captcha({ id, value, onChange, onTokenChange, refreshKey = 0, disabled = false, hasError = false }) {
  const [captcha, setCaptcha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const load = useCallback(async (signal) => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await fetchCaptcha({ signal });
      setCaptcha(data);
      onTokenChange?.(data.token);
    } catch (error) {
      if (error.name === 'AbortError') return;
      setCaptcha(null);
      onTokenChange?.('');
      setLoadError('验证码加载失败，点击重试');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [onTokenChange]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load, refreshKey]);

  const refresh = () => {
    if (!loading) load();
  };

  return (
    <div className={styles.wrapper}>
      <input
        id={id}
        name="captcha"
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCapitalize="characters"
        maxLength={4}
        placeholder="请输入验证码"
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? `${id}-error` : undefined}
        required
      />
      <div className={styles.imageGroup}>
        <button
          type="button"
          className={styles.image}
          onClick={refresh}
          disabled={loading}
          aria-label="点击刷新验证码"
          title="看不清？点击刷新"
        >
          {loading && <span className={styles.status}>加载中…</span>}
          {!loading && loadError && <span className={`${styles.status} ${styles.statusError}`}>{loadError}</span>}
          {!loading && captcha && <img src={captcha.image} alt="图形验证码" width={120} height={40} />}
        </button>
        <button type="button" className={styles.refresh} onClick={refresh} disabled={loading} aria-label="刷新验证码">
          <FaSyncAlt className={loading ? styles.spinning : undefined} />
        </button>
      </div>
    </div>
  );
}
