import styles from './FramedImage.module.css';

/**
 * Shows a cropped region of a full image inside a frame matching the crop aspect
 * so the visible region is never stretched.
 */
export default function FramedImage({
  src,
  crop,
  alt,
  className = '',
  fit = 'cover',
}) {
  if (!src) return null;

  if (!crop) {
    return (
      <img
        src={src}
        alt={alt || ''}
        className={className}
        loading="lazy"
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          objectFit: fit,
          objectPosition: 'center center',
        }}
      />
    );
  }

  const { x, y, width, height } = crop;
  const safeWidth = width > 0 ? width : 1;
  const safeHeight = height > 0 ? height : 1;

  return (
    <div
      className={`${styles.frame} ${className}`}
      style={{ aspectRatio: `${safeWidth} / ${safeHeight}` }}
    >
      <img
        src={src}
        alt={alt || ''}
        className={styles.image}
        loading="lazy"
        style={{
          width: `${(1 / safeWidth) * 100}%`,
          height: `${(1 / safeHeight) * 100}%`,
          left: `${-(x / safeWidth) * 100}%`,
          top: `${-(y / safeHeight) * 100}%`,
        }}
      />
    </div>
  );
}
