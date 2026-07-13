import { useEffect } from 'react';
import styles from './ImageLightbox.module.css';

export default function ImageLightbox({
  items,
  activeIndex,
  onClose,
  onChangeIndex,
}) {
  const item = items[activeIndex];
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < items.length - 1;

  useEffect(() => {
    if (activeIndex == null) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft' && hasPrev) onChangeIndex(activeIndex - 1);
      if (event.key === 'ArrowRight' && hasNext) onChangeIndex(activeIndex + 1);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeIndex, hasPrev, hasNext, onChangeIndex, onClose]);

  if (activeIndex == null || !item?.src) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={item.label || item.alt || 'Full size image'}
      onClick={onClose}
    >
      <div className={styles.dialog} onClick={(event) => event.stopPropagation()}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>

        {hasPrev ? (
          <button
            type="button"
            className={`${styles.nav} ${styles.navPrev}`}
            onClick={() => onChangeIndex(activeIndex - 1)}
            aria-label="Previous image"
          >
            ←
          </button>
        ) : null}

        <figure className={styles.figure}>
          <img src={item.src} alt={item.alt || item.label || ''} className={styles.image} />
          {item.label ? <figcaption className={styles.caption}>{item.label}</figcaption> : null}
        </figure>

        {hasNext ? (
          <button
            type="button"
            className={`${styles.nav} ${styles.navNext}`}
            onClick={() => onChangeIndex(activeIndex + 1)}
            aria-label="Next image"
          >
            →
          </button>
        ) : null}
      </div>
    </div>
  );
}
