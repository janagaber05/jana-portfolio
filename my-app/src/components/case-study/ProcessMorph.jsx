import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScreenInFrame } from './DeviceFrame';
import { getScreenImageSrc } from '../../utils/caseStudyImage';

gsap.registerPlugin(ScrollTrigger);

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function prefersSnapGallery() {
  return window.matchMedia('(max-width: 900px), (hover: none)').matches;
}

export default function ProcessMorph({ stages = [], onInspect }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const items = useMemo(
    () => (stages || []).filter((s) => Boolean(getScreenImageSrc(s))),
    [stages],
  );
  const [index, setIndex] = useState(0);
  const [snapMode, setSnapMode] = useState(() => (
    typeof window !== 'undefined' && (prefersSnapGallery() || prefersReducedMotion())
  ));

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(max-width: 900px), (hover: none), (prefers-reduced-motion: reduce)');
    const sync = () => setSnapMode(mq.matches);
    sync();
    mq.addEventListener?.('change', sync);
    return () => mq.removeEventListener?.('change', sync);
  }, []);

  /* Desktop: pin + scrub through stages */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || items.length < 2 || snapMode || prefersReducedMotion()) return undefined;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${window.innerHeight * Math.max(1.2, items.length * 0.85)}`,
        pin: true,
        scrub: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const next = Math.min(
            items.length - 1,
            Math.floor(self.progress * items.length),
          );
          setIndex(next);
        },
      });
    }, section);

    return () => ctx.revert();
  }, [items.length, snapMode]);

  /* Phone: horizontal snap track drives the active stage */
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !snapMode || items.length < 2) return undefined;

    const syncIndex = () => {
      const center = track.scrollLeft + track.clientWidth / 2;
      let closest = 0;
      let closestDistance = Infinity;
      [...track.children].forEach((child, i) => {
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
  }, [items.length, snapMode]);

  if (!items.length) return null;

  const current = items[index] || items[0];

  return (
    <section
      id="section-process"
      className={`cs-process${snapMode ? ' is-snap' : ''}`}
      ref={sectionRef}
      aria-label="Design process"
    >
      <div className="cs-process-inner">
        <div className="cs-process-copy">
          <p className="cs-kicker">Design process</p>
          <p className="cs-process-step">
            Step {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </p>
          <h2 className="cs-process-title">{current.label || 'Stage'}</h2>
          {current.description ? <p className="cs-process-desc">{current.description}</p> : null}
          <ol className="cs-process-dots" aria-hidden="true">
            {items.map((stage, i) => (
              <li key={`${stage.label}-${i}`} className={i === index ? 'is-active' : ''} />
            ))}
          </ol>
        </div>

        {snapMode ? (
          <div
            className="cs-process-track"
            ref={trackRef}
            role="region"
            aria-label="Process screens"
          >
            {items.map((stage, i) => (
              <figure key={`${getScreenImageSrc(stage)}-${i}`} className="cs-process-slide">
                <ScreenInFrame screen={stage} onInspect={onInspect} bob={false} tilt={false} />
              </figure>
            ))}
          </div>
        ) : (
          <div className="cs-process-frame">
            {items.map((stage, i) => (
              <div
                key={`${getScreenImageSrc(stage)}-${i}`}
                className={`cs-process-layer${i === index ? ' is-active' : ''}`}
              >
                <ScreenInFrame screen={stage} onInspect={onInspect} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
