import { useEffect, useMemo, useState } from 'react';
import { getScreenDisplayCrop, getScreenImageSrc } from '../utils/caseStudyImage';
import styles from './CaseStudyScreenGallery.module.css';

function cropObjectPosition(crop) {
  if (!crop) return 'center top';
  const x = (crop.x + crop.width / 2) * 100;
  const y = (crop.y + crop.height / 2) * 100;
  return `${x}% ${y}%`;
}

function GalleryImage({ screen, alt, variant }) {
  const imageUrl = getScreenImageSrc(screen);
  const displayCrop = getScreenDisplayCrop(screen);
  const candidates = useMemo(
    () => screen?.imageCandidates || [],
    [screen?.imageCandidates],
  );
  const fallback = screen?.fallbackImage || '';

  const sources = useMemo(() => {
    const list = [];
    if (imageUrl) list.push(imageUrl);
    [...candidates, fallback].forEach((src) => {
      if (src && !list.includes(src)) list.push(src);
    });
    return list;
  }, [imageUrl, candidates, fallback]);

  const [sourceIndex, setSourceIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSourceIndex(0);
    setFailed(false);
  }, [imageUrl, candidates, fallback]);

  if (!sources.length || failed) {
    return <div className={styles.missing} aria-hidden="true" />;
  }

  const src = sources[sourceIndex];
  const useContain = variant === 'board';

  return (
    <img
      src={src}
      alt={alt}
      className={useContain ? styles.imageContain : styles.image}
      loading="lazy"
      style={{ objectPosition: cropObjectPosition(displayCrop) }}
      onError={() => {
        setSourceIndex((current) => {
          if (current < sources.length - 1) return current + 1;
          setFailed(true);
          return current;
        });
      }}
    />
  );
}

export default function CaseStudyScreenGallery({
  screens,
  onInspect,
  hint = 'Scroll sideways · Tap to view full size',
  accent,
  showHeader = true,
  variant = 'phone',
}) {
  const visibleScreens = (screens || []).filter((screen) => Boolean(getScreenImageSrc(screen)));

  if (!visibleScreens.length) {
    return null;
  }

  const frameClass = variant === 'board' ? styles.frameBoard : styles.framePhone;

  return (
    <div
      className={styles.gallery}
      style={accent ? { '--gallery-accent': accent } : undefined}
    >
      {showHeader ? (
        <div className={styles.header}>
          <p className={styles.hint}>{hint}</p>
        </div>
      ) : null}

      <div className={styles.track}>
        {visibleScreens.map((screen, index) => (
          <figure
            key={`${screen.label || 'screen'}-${index}`}
            className={styles.item}
          >
            <button
              type="button"
              className={frameClass}
              onClick={() => onInspect?.(index, screen)}
              aria-label={`View full size: ${screen.label || `Screen ${index + 1}`}`}
            >
              <GalleryImage
                screen={screen}
                alt={screen.alt || screen.label}
                variant={variant}
              />
            </button>
            {screen.label ? (
              <figcaption className={styles.label}>{screen.label}</figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </div>
  );
}
