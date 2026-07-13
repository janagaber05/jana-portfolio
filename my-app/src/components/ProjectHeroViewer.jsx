import { useCallback, useEffect, useRef, useState } from 'react';
import { resolveImageSources } from '../utils/resolveImageSources';
import styles from './ProjectHeroViewer.module.css';

function ScreenImage({ imageUrl, candidates, fallback, alt }) {
  const sources = resolveImageSources(imageUrl, candidates, fallback);
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => {
    setSourceIndex(0);
  }, [imageUrl, candidates, fallback]);

  return (
    <img
      src={sources[sourceIndex]}
      alt={alt}
      className={styles.screenImage}
      draggable={false}
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

export default function ProjectHeroViewer({ screens, accent }) {
  const trackRef = useRef(null);
  const slideRefs = useRef([]);
  const dragRef = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const syncActiveIndex = useCallback(() => {
    const track = trackRef.current;
    if (!track || !slideRefs.current.length) return;

    const center = track.scrollLeft + track.clientWidth / 2;
    let closest = 0;
    let closestDistance = Infinity;

    slideRefs.current.forEach((slide, index) => {
      if (!slide) return;
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const distance = Math.abs(center - slideCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = index;
      }
    });

    setActiveIndex(closest);
  }, []);

  const scrollToIndex = useCallback((index) => {
    const slide = slideRefs.current[index];
    const track = trackRef.current;
    if (!slide || !track) return;

    track.scrollTo({
      left: slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2,
      behavior: 'smooth',
    });
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const onScroll = () => syncActiveIndex();
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, [syncActiveIndex, screens.length]);

  const onPointerDown = (event) => {
    const track = trackRef.current;
    if (!track) return;

    dragRef.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: track.scrollLeft,
      moved: false,
    };
    setIsDragging(true);
    track.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event) => {
    const track = trackRef.current;
    const drag = dragRef.current;
    if (!track || !drag.active) return;

    const delta = event.clientX - drag.startX;
    if (Math.abs(delta) > 4) drag.moved = true;
    track.scrollLeft = drag.scrollLeft - delta;
  };

  const endDrag = (event) => {
    const track = trackRef.current;
    const drag = dragRef.current;
    if (!track || !drag.active) return;

    drag.active = false;
    setIsDragging(false);

    if (track.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }

    const center = track.scrollLeft + track.clientWidth / 2;
    let closest = 0;
    let closestDistance = Infinity;

    slideRefs.current.forEach((slide, index) => {
      if (!slide) return;
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const distance = Math.abs(center - slideCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = index;
      }
    });

    setActiveIndex(closest);
    scrollToIndex(closest);
  };

  if (!screens?.length) {
    return (
      <div className={styles.viewer}>
        <p className={styles.empty}>Add screen images in the case study editor to show them here.</p>
      </div>
    );
  }

  return (
    <div
      className={styles.viewer}
      style={{ '--viewer-accent': accent || '#FFD5FB' }}
    >
      <div className={styles.viewerTop}>
        <GripIcon className={styles.viewerGrip} />
        <p className={styles.viewerHint}>Drag to explore project screens</p>
      </div>

      <div
        ref={trackRef}
        className={`${styles.track} ${isDragging ? styles.trackDragging : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        role="region"
        aria-label="Project screens viewer"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') scrollToIndex(Math.min(activeIndex + 1, screens.length - 1));
          if (event.key === 'ArrowLeft') scrollToIndex(Math.max(activeIndex - 1, 0));
        }}
      >
        {screens.map((screen, index) => (
          <figure
            key={screen.label || index}
            ref={(node) => { slideRefs.current[index] = node; }}
            className={`${styles.slide} ${activeIndex === index ? styles.slideActive : ''}`}
          >
            <div className={styles.screenFrame}>
              <ScreenImage
                imageUrl={screen.imageUrl}
                candidates={screen.imageCandidates || []}
                fallback={screen.fallbackImage}
                alt={screen.alt || screen.label}
              />
            </div>
            <figcaption className={styles.screenLabel}>{screen.label}</figcaption>
          </figure>
        ))}
      </div>

      <div className={styles.dots} aria-hidden="true">
        {screens.map((screen, index) => (
          <button
            key={screen.label || index}
            type="button"
            className={`${styles.dot} ${activeIndex === index ? styles.dotActive : ''}`}
            onClick={() => scrollToIndex(index)}
            aria-label={`View ${screen.label}`}
          />
        ))}
      </div>
    </div>
  );
}
