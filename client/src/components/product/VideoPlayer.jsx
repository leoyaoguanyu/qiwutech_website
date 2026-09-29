import { useState } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import styles from './VideoPlayer.module.css';

/** 演示视频卡片，视频加载失败时显示友好提示 */
export default function VideoPlayer({ src, type = 'video/webm', poster, title, description }) {
  const [failed, setFailed] = useState(false);

  return (
    <figure className={styles.demo}>
      {failed ? (
        <div className={styles.fallback} role="alert">
          <FaExclamationTriangle aria-hidden="true" />
          <p>视频加载失败</p>
          <p className={styles.hint}>请检查视频文件是否存在或稍后重试</p>
        </div>
      ) : (
        <video
          className={styles.player}
          controls
          preload="metadata"
          playsInline
          poster={poster}
          onError={() => setFailed(true)}
        >
          <source src={src} type={type} onError={() => setFailed(true)} />
          您的浏览器不支持视频播放。请尝试使用 Chrome、Firefox 或 Safari。
        </video>
      )}
      <figcaption>
        <h3 className={styles.title}>{title}</h3>
        {description && <p className={styles.description}>{description}</p>}
      </figcaption>
    </figure>
  );
}
