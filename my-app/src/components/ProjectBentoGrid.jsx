import { useEffect, useMemo, useState } from 'react';
import FramedImage from './FramedImage';
import { getScreenDisplayCrop, getScreenImageSrc } from '../utils/caseStudyImage';
import styles from './ProjectBentoGrid.module.css';

function BentoImage({ screen, alt }) {
  const imageUrl = getScreenImageSrc(screen);
  const displayCrop = getScreenDisplayCrop(screen);
  const candidates = screen?.imageCandidates || [];
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
    return <div className={styles.bentoMissing} aria-hidden="true" />;
  }

  const src = sources[sourceIndex];

  if (displayCrop) {
    return (
      <FramedImage
        src={src}
        crop={displayCrop}
        alt={alt}
        className={styles.bentoImage}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={styles.bentoImage}
      loading="lazy"
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

export function GripIcon({ className = '' }) {
  return (
    <span className={`${styles.grip} ${className}`} aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <span key={index} className={styles.gripDot} />
      ))}
    </span>
  );
}

export default function ProjectBentoGrid({ screens, accent, onInspect }) {
  const visibleScreens = (screens || []).filter((screen) => Boolean(getScreenImageSrc(screen)));

  if (!visibleScreens.length) {
    return null;
  }

  return (
    <div className={styles.bentoWrap} style={{ '--bento-accent': accent || '#FFD5FB' }}>
      <div className={styles.bentoHeader}>
        <GripIcon />
        <p className={styles.bentoHint}>Tap a screen to view full size</p>
      </div>

      <div
        className={styles.bentoGrid}
        data-count={Math.min(visibleScreens.length, 8)}
      >
        {visibleScreens.map((screen, index) => (
          <figure
            key={`${screen.label || 'screen'}-${index}`}
            className={styles.bentoCell}
          >
            <button
              type="button"
              className={styles.bentoFrame}
              onClick={() => onInspect?.(index, screen)}
              aria-label={`View full size: ${screen.label || `Screen ${index + 1}`}`}
            >
              <BentoImage
                screen={screen}
                alt={screen.alt || screen.label}
              />
            </button>
            {screen.label ? (
              <figcaption className={styles.bentoLabel}>{screen.label}</figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </div>
  );
}
