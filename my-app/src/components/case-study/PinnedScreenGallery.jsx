import { useEffect, useMemo, useRef, useState } from 'react';
import { ScreenInFrame } from './DeviceFrame';
import { getScreenImageSrc } from '../../utils/caseStudyImage';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function runwayMultiplier(count, width) {
  if (width < 900) return Math.max(1.5, count * 0.65);
  return Math.max(1.2, count * 0.4);
}

export default function PinnedScreenGallery({ screens = [], onInspect }) {
  const runwayRef = useRef(null);
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);
  const [snapFallback, setSnapFallback] = useState(() => (
    typeof window !== 'undefined' && prefersReducedMotion()
  ));

  const items = useMemo(
    () => (screens || []).filter((s) => Boolean(getScreenImageSrc(s))),
    [screens],
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setSnapFallback(mq.matches);
    sync();
    mq.addEventListener?.('change', sync);
    return () => mq.removeEventListener?.('change', sync);
  }, []);

  /* Vertical scroll → sticky section + sideways scrub (no GSAP pin). */
  useEffect(() => {
    const runway = runwayRef.current;
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!runway || !section || !track || items.length < 2 || snapFallback) return undefined;

    const syncRunwayHeight = () => {
      const overflow = Math.max(0, track.scrollWidth - section.clientWidth + 48);
      const minTravel = window.innerHeight * runwayMultiplier(items.length, window.innerWidth);
      const travel = Math.max(overflow * 1.15, minTravel);
      runway.style.height = `${section.offsetHeight + travel}px`;
    };

    const apply = () => {
      const total = Math.max(1, runway.offsetHeight - window.innerHeight);
      const scrolled = Math.min(total, Math.max(0, -runway.getBoundingClientRect().top));
      const progress = scrolled / total;
      const overflow = Math.max(0, track.scrollWidth - section.clientWidth + 48);
      track.style.transform = `translate3d(${-overflow * progress}px, 0, 0)`;

      const next = Math.min(
        items.length - 1,
        Math.max(0, Math.floor(progress * items.length - 1e-6)),
      );
      if (next !== indexRef.current) {
        indexRef.current = next;
        setIndex(next);
      }
    };

    syncRunwayHeight();
    apply();

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };
    const onResize = () => {
      syncRunwayHeight();
      apply();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('load', onResize);
    const images = [...track.querySelectorAll('img')];
    images.forEach((img) => {
      if (!img.complete) img.addEventListener('load', onResize, { once: true });
    });
    const t1 = window.setTimeout(onResize, 200);
    const t2 = window.setTimeout(onResize, 800);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('load', onResize);
      track.style.transform = '';
      runway.style.height = '';
    };
  }, [items.length, snapFallback]);

  /* Reduced-motion fallback: native horizontal snap */
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !snapFallback || items.length < 2) return undefined;

    const syncIndex = () => {
      const center = track.scrollLeft + track.clientWidth / 2;
      let closest = 0;
      let closestDistance = Infinity;
      [...track.querySelectorAll('.cs-gallery-item')].forEach((child, i) => {
        const mid = child.offsetLeft + child.offsetWidth / 2;
        const distance = Math.abs(center - mid);
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = i;
        }
      });
      setIndex(closest);
    };

    syncIndex();
    track.addEventListener('scroll', syncIndex, { passive: true });
    window.addEventListener('resize', syncIndex);
    return () => {
      track.removeEventListener('scroll', syncIndex);
      window.removeEventListener('resize', syncIndex);
    };
  }, [items.length, snapFallback]);

  if (!items.length) return null;

  const gallery = (
    <section
      id="section-final"
      className={`cs-gallery${snapFallback ? ' is-snap' : ' is-sticky'}`}
      ref={sectionRef}
      aria-label="Final screens"
    >
      <div className="cs-gallery-head">
        <p className="cs-kicker">Final design</p>
        <p className="cs-gallery-count">
          {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
        </p>
      </div>
      <div className="cs-gallery-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${(index + 1) / items.length})` }} />
      </div>
      <div className="cs-gallery-track" ref={trackRef}>
        {items.map((screen) => (
          <figure key={`${screen.label}-${getScreenImageSrc(screen)}`} className="cs-gallery-item">
            <ScreenInFrame
              screen={screen}
              onInspect={onInspect}
              bob={false}
              tilt={false}
            />
            {screen.label ? <figcaption>{screen.label}</figcaption> : null}
          </figure>
        ))}
      </div>
    </section>
  );

  if (snapFallback) return gallery;

  return (
    <div className="cs-gallery-runway" ref={runwayRef}>
      {gallery}
    </div>
  );
}
