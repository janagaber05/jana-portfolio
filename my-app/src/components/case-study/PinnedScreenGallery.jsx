import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScreenInFrame } from './DeviceFrame';
import { getScreenImageSrc } from '../../utils/caseStudyImage';

gsap.registerPlugin(ScrollTrigger);

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function PinnedScreenGallery({ screens = [], onInspect }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
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

  /* Phone + desktop: vertical scroll pins the gallery and scrubs images sideways */
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || items.length < 2 || snapFallback) return undefined;

    const ctx = gsap.context(() => {
      const getOverflow = () => Math.max(0, track.scrollWidth - section.clientWidth + 48);

      const tween = gsap.to(track, {
        x: () => -getOverflow(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => {
            const overflow = getOverflow();
            // Give phones enough scroll distance to scrub through every screen.
            const minTravel = window.innerWidth < 900
              ? window.innerHeight * Math.max(1.4, items.length * 0.55)
              : window.innerHeight;
            return `+=${Math.max(overflow * 1.2, minTravel)}`;
          },
          pin: true,
          scrub: 0.65,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const next = Math.min(
              items.length - 1,
              Math.floor(self.progress * items.length),
            );
            setIndex(next);
          },
        },
      });

      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener('load', refresh);
      window.addEventListener('resize', refresh);
      const images = [...track.querySelectorAll('img, .cs-device-img')];
      images.forEach((img) => img.addEventListener?.('load', refresh));
      const t = window.setTimeout(refresh, 400);

      return () => {
        window.clearTimeout(t);
        window.removeEventListener('load', refresh);
        window.removeEventListener('resize', refresh);
        images.forEach((img) => img.removeEventListener?.('load', refresh));
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    }, section);

    return () => ctx.revert();
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

  return (
    <section
      id="section-final"
      className={`cs-gallery${snapFallback ? ' is-snap' : ''}`}
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
}
