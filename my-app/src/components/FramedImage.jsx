import styles from './FramedImage.module.css';

/**
 * Shows a cropped region of a full image inside a fixed frame.
 * crop: { x, y, width, height } normalized 0–1 on the source image.
 */
export default function FramedImage({ src, crop, alt, className = '' }) {
  if (!src) return null;

  if (!crop) {
    return (
      <img
        src={src}
        alt={alt || ''}
        className={className}
        loading="lazy"
      />
    );
  }

  const { x, y, width, height } = crop;
  const safeWidth = width > 0 ? width : 1;
  const safeHeight = height > 0 ? height : 1;

  return (
    <div className={`${styles.frame} ${className}`}>
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
