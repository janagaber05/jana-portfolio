import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScreenInFrame } from './DeviceFrame';
import { getScreenImageSrc } from '../../utils/caseStudyImage';

gsap.registerPlugin(ScrollTrigger);

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function ProcessMorph({ stages = [], onInspect }) {
  const sectionRef = useRef(null);
  const items = useMemo(
    () => (stages || []).filter((s) => Boolean(getScreenImageSrc(s))),
    [stages],
  );
  const [index, setIndex] = useState(0);

  /* Phone + desktop: pin and scrub through wireframe / process screens */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || items.length < 2 || prefersReducedMotion()) return undefined;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => {
          const perStage = window.innerWidth < 900 ? 0.95 : 0.85;
          return `+=${window.innerHeight * Math.max(1.35, items.length * perStage)}`;
        },
        pin: true,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const next = Math.min(
            items.length - 1,
            Math.floor(self.progress * items.length),
          );
          setIndex(next);
        },
      });

      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener('load', refresh);
      window.addEventListener('resize', refresh);
      const t = window.setTimeout(refresh, 400);

      return () => {
        window.clearTimeout(t);
        window.removeEventListener('load', refresh);
        window.removeEventListener('resize', refresh);
      };
    }, section);

    return () => ctx.revert();
  }, [items.length]);

  if (!items.length) return null;

  const current = items[index] || items[0];

  return (
    <section
      id="section-process"
      className="cs-process"
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
}
