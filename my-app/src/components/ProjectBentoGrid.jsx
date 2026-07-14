import { useEffect, useMemo, useState } from 'react';
import styles from './ProjectBentoGrid.module.css';

function BentoImage({ imageUrl, candidates, fallback, alt }) {
  // Prefer the CMS upload. Local folder candidates are only a silent fallback.
  const sources = useMemo(() => {
    const list = [];
    if (imageUrl) list.push(imageUrl);
    [...(candidates || []), fallback].forEach((src) => {
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

  return (
    <img
      src={sources[sourceIndex]}
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
  // Only show screens that have a CMS-uploaded image URL.
  const visibleScreens = (screens || []).filter((screen) => Boolean(screen?.imageUrl));

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
                imageUrl={screen.imageUrl}
                candidates={[]}
                fallback=""
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
