import { useEffect, useMemo, useState } from 'react';
import { getResolvedImageSrc } from '../utils/resolveImageSources';
import ImageLightbox from './ImageLightbox';
import styles from './ProjectBentoGrid.module.css';

export const BENTO_MAX_SCREENS = 4;

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

export default function ProjectBentoGrid({ screens, accent }) {
  const visibleScreens = (screens || []).slice(0, BENTO_MAX_SCREENS);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const lightboxItems = useMemo(
    () => visibleScreens.map((screen) => ({
      src: getResolvedImageSrc(screen.imageUrl, screen.imageCandidates, screen.fallbackImage),
      alt: screen.alt || screen.label,
      label: screen.label,
    })).filter((item) => item.src),
    [visibleScreens],
  );

  if (!visibleScreens.length) {
    return (
      <div className={styles.bentoEmpty}>
        Add 4 screen images in the case study editor to show them here.
      </div>
    );
  }

  return (
    <div className={styles.bentoWrap} style={{ '--bento-accent': accent || '#FFD5FB' }}>
      <div className={styles.bentoHeader}>
        <GripIcon />
        <p className={styles.bentoHint}>Tap a screen to view full size</p>
      </div>

      <div className={styles.bentoGrid} data-count={visibleScreens.length}>
        {visibleScreens.map((screen, index) => (
          <figure
            key={screen.label || index}
            className={`${styles.bentoCell} ${styles[`bento${BENTO_SLOTS[index]}`]}`}
          >
            <button
              type="button"
              className={styles.bentoFrame}
              onClick={() => setLightboxIndex(index)}
              aria-label={`View full size: ${screen.label}`}
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
        ))}
      </div>

      <ImageLightbox
        items={lightboxItems}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChangeIndex={setLightboxIndex}
      />
    </div>
  );
}
