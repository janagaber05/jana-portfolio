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

  const items = useMemo(
    () => (screens || []).filter((s) => Boolean(getScreenImageSrc(s))),
    [screens],
  );

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || items.length < 2) return undefined;
    if (prefersReducedMotion() || window.innerWidth < 768) return undefined;

    const ctx = gsap.context(() => {
      const getOverflow = () => Math.max(0, track.scrollWidth - section.clientWidth + 48);

      const tween = gsap.to(track, {
        x: () => -getOverflow(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${Math.max(getOverflow() * 1.15, window.innerHeight)}`,
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

      const onLoad = () => ScrollTrigger.refresh();
      window.addEventListener('load', onLoad);
      const t = window.setTimeout(onLoad, 400);

      return () => {
        window.clearTimeout(t);
        window.removeEventListener('load', onLoad);
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    }, section);

    return () => ctx.revert();
  }, [items.length]);

  if (!items.length) return null;

  const mobile = typeof window !== 'undefined' && (window.innerWidth < 768 || prefersReducedMotion());

  return (
    <section
      id="section-final"
      className={`cs-gallery${mobile ? ' is-snap' : ''}`}
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
