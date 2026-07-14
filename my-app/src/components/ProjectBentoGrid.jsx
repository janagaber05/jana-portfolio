import { useEffect, useState } from 'react';
import { getResolvedImageSrc } from '../utils/resolveImageSources';
import styles from './ProjectBentoGrid.module.css';

const BENTO_SLOTS = ['Feature', 'StackTop', 'StackBottom', 'Wide'];

function BentoImage({ imageUrl, candidates, fallback, alt }) {
  const src = getResolvedImageSrc(imageUrl, candidates, fallback);
  const sources = [src, ...[...(candidates || []), fallback].filter((s) => s && s !== src)];
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => {
    setSourceIndex(0);
  }, [imageUrl, candidates, fallback]);

  return (
    <img
      src={sources[sourceIndex]}
      alt={alt}
      className={styles.bentoImage}
      loading="lazy"
      onError={() => {
        setSourceIndex((current) => (
          current < sources.length - 1 ? current + 1 : current
        ));
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
  const visibleScreens = screens || [];
  const count = visibleScreens.length;
  const useFlowLayout = count > 4;

  if (!visibleScreens.length) {
    return (
      <div className={styles.bentoEmpty}>
        Add screen images in the case study editor to show them here.
      </div>
    );
  }

  return (
    <div className={styles.bentoWrap} style={{ '--bento-accent': accent || '#FFD5FB' }}>
      <div className={styles.bentoHeader}>
        <GripIcon />
        <p className={styles.bentoHint}>Tap a screen to view full size</p>
      </div>

      <div
        className={styles.bentoGrid}
        data-count={useFlowLayout ? 'many' : String(count)}
      >
        {visibleScreens.map((screen, index) => {
          const slotName = useFlowLayout
            ? 'Extra'
            : (BENTO_SLOTS[index] || 'Extra');

          return (
            <figure
              key={`${screen.label || 'screen'}-${index}`}
              className={`${styles.bentoCell} ${styles[`bento${slotName}`]}`}
            >
              <button
                type="button"
                className={styles.bentoFrame}
                onClick={() => onInspect?.(index, screen)}
                aria-label={`View full size: ${screen.label || `Screen ${index + 1}`}`}
              >
                <BentoImage
                  imageUrl={screen.imageUrl}
                  candidates={screen.imageCandidates || []}
                  fallback={screen.fallbackImage}
                  alt={screen.alt || screen.label}
                />
              </button>
              <figcaption className={styles.bentoLabel}>{screen.label}</figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
