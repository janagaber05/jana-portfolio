import CaseStudyScreenGallery from './CaseStudyScreenGallery';
import { getScreenImageSrc } from '../utils/caseStudyImage';
import styles from './ProjectBentoGrid.module.css';

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
      </div>
      <CaseStudyScreenGallery
        screens={visibleScreens}
        onInspect={onInspect}
        accent={accent}
        showHeader
      />
    </div>
  );
}
