import { useEffect, useMemo, useRef, useState } from 'react';
import { ScreenInFrame } from './DeviceFrame';
import { getScreenImageSrc } from '../../utils/caseStudyImage';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function ProcessMorph({ stages = [], onInspect }) {
  const runwayRef = useRef(null);
  const sectionRef = useRef(null);
  const indexRef = useRef(0);
  const items = useMemo(
    () => (stages || []).filter((s) => Boolean(getScreenImageSrc(s))),
    [stages],
  );
  const [index, setIndex] = useState(0);
  const reduced = typeof window !== 'undefined' && prefersReducedMotion();

  /* Sticky runway: scroll progress steps through wireframe / process screens */
  useEffect(() => {
    const runway = runwayRef.current;
    const section = sectionRef.current;
    if (!runway || !section || items.length < 2 || reduced) return undefined;

    const syncRunwayHeight = () => {
      const perStage = window.innerWidth < 900 ? 0.95 : 0.85;
      const travel = window.innerHeight * Math.max(1.35, items.length * perStage);
      runway.style.height = `${section.offsetHeight + travel}px`;
    };

    const apply = () => {
      const total = Math.max(1, runway.offsetHeight - window.innerHeight);
      const scrolled = Math.min(total, Math.max(0, -runway.getBoundingClientRect().top));
      const progress = scrolled / total;
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
    const t = window.setTimeout(onResize, 300);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      runway.style.height = '';
    };
  }, [items.length, reduced]);

  if (!items.length) return null;

  const current = items[index] || items[0];

  const section = (
    <section
      id="section-process"
      className={`cs-process${reduced ? '' : ' is-sticky'}`}
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

        <div className="cs-process-frame">
          {items.map((stage, i) => (
            <div
              key={`${getScreenImageSrc(stage)}-${i}`}
              className={`cs-process-layer${i === index ? ' is-active' : ''}`}
            >
              <ScreenInFrame
                screen={stage}
                onInspect={onInspect}
                bob={false}
                tilt={false}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (reduced) return section;

  return (
    <div className="cs-process-runway" ref={runwayRef}>
      {section}
    </div>
  );
}
