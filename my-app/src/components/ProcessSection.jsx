import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSiteContent } from '../context/SiteContentContext';
import styles from './ProcessSection.module.css';

gsap.registerPlugin(ScrollTrigger);

const SCROLL_RUNWAY_PER_STEP = 0.42;

const ICONS = {
  discovery: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2.5" />
      <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="10.5" cy="10.5" r="2.25" fill="currentColor" />
    </svg>
  ),
  blueprint: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.75" stroke="currentColor" strokeWidth="2.25" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.75" stroke="currentColor" strokeWidth="2.25" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.75" stroke="currentColor" strokeWidth="2.25" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.75" fill="currentColor" />
    </svg>
  ),
  build: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.75 19.25 8 18l10.1-10.1a2.2 2.2 0 0 0 0-3.1L15.2 3.25a2.2 2.2 0 0 0-3.1 0L2 13.35l-1.25 4.65 4-1.75z"
        fill="currentColor"
      />
      <path d="M13.25 5.25 18.75 10.75" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
    </svg>
  ),
  testing: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 4.5a7.5 7.5 0 107.5 7.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M12 8.5v4.25l2.75 1.75" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  ),
  deploy: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.5l8.5 6.25-8.5 6.75L3.5 8.75 12 2.5z"
        fill="currentColor"
      />
      <path
        d="M5.5 10.75v5.75c0 1.65 2.9 3 6.5 3s6.5-1.35 6.5-3v-5.75"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
      <path d="M12 19.5v2.25" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
};

function ProcessIcon({ icon }) {
  return <span className={styles.stepIcon}>{ICONS[icon] || ICONS.discovery}</span>;
}

function TimelineStep({ step, index, stepRef }) {
  const iconOnLeft = index % 2 === 0;

  return (
    <li
      ref={stepRef}
      className={`${styles.timelineStep} ${iconOnLeft ? styles.iconLeft : styles.iconRight}`}
    >
      <div className={styles.stepRow}>
        {iconOnLeft ? (
          <>
            <div className={styles.stepIconCol}>
              <ProcessIcon icon={step.icon} />
            </div>
            <div className={styles.stepContentCol}>
              <span className={styles.stepNum}>{step.num}</span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDescription}>{step.description}</p>
            </div>
          </>
        ) : (
          <>
            <div className={styles.stepContentCol}>
              <span className={styles.stepNum}>{step.num}</span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDescription}>{step.description}</p>
            </div>
            <div className={styles.stepIconCol}>
              <ProcessIcon icon={step.icon} />
            </div>
          </>
        )}
      </div>
    </li>
  );
}

export default function ProcessSection() {
  const { content, loading } = useSiteContent();
  const process = content?.process;
  const sectionRef = useRef(null);
  const timelineRef = useRef(null);
  const highlightRef = useRef(null);
  const stepRefs = useRef([]);

  const steps = Array.isArray(process?.steps) ? process.steps : [];
  const stepCount = Math.max(steps.length, 1);

  const sectionHeight = useMemo(
    () => `calc(100vh + ${(stepCount - 1) * SCROLL_RUNWAY_PER_STEP * 100}vh)`,
    [stepCount],
  );

  useEffect(() => {
    if (loading) return undefined;

    const section = sectionRef.current;
    const timeline = timelineRef.current;
    const highlight = highlightRef.current;
    const stepEls = stepRefs.current.filter(Boolean);

    if (!section || !timeline || !highlight || !stepEls.length) return undefined;

    const getStepActivation = (raw, index) => Math.max(0, 1 - Math.abs(raw - index));

    const measureSteps = () => {
      const listTop = timeline.querySelector(`.${styles.timelineList}`)?.offsetTop || 0;

      return stepEls.map((step) => ({
        top: listTop + step.offsetTop,
        height: step.offsetHeight,
      }));
    };

    let stepMetrics = measureSteps();
    let trigger;

    const updateVisuals = (raw) => {
      const clampedRaw = Math.min(stepEls.length - 1, Math.max(0, raw));

      stepEls.forEach((stepEl, index) => {
        const activation = getStepActivation(clampedRaw, index);
        stepEl.style.setProperty('--step-progress', activation.toFixed(3));

        const icon = stepEl.querySelector(`.${styles.stepIcon}`);
        if (icon) {
          icon.style.setProperty('--icon-progress', activation.toFixed(3));
        }
      });

      const lower = Math.min(stepEls.length - 1, Math.floor(clampedRaw));
      const upper = Math.min(stepEls.length - 1, lower + 1);
      const segmentProgress = clampedRaw - lower;
      const eased = gsap.parseEase('power2.inOut')(segmentProgress);

      if (lower === upper) {
        const metric = stepMetrics[lower];
        if (!metric) return;
        gsap.set(highlight, { top: metric.top, height: metric.height });
        return;
      }

      const from = stepMetrics[lower];
      const to = stepMetrics[upper];
      if (!from || !to) return;

      gsap.set(highlight, {
        top: from.top + (to.top - from.top) * eased,
        height: from.height + (to.height - from.height) * eased,
      });
    };

    const syncProgress = () => {
      if (!trigger) return;
      updateVisuals(trigger.progress * (stepEls.length - 1));
    };

    const ctx = gsap.context(() => {
      const setup = () => {
        stepMetrics = measureSteps();
        updateVisuals(0);

        trigger = ScrollTrigger.create({
          id: 'process-timeline',
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.35,
          invalidateOnRefresh: true,
          onRefresh: () => {
            stepMetrics = measureSteps();
            syncProgress();
          },
          onUpdate: (self) => {
            updateVisuals(self.progress * (stepEls.length - 1));
          },
        });

        ScrollTrigger.refresh();
        syncProgress();
      };

      const layoutId = window.setTimeout(setup, 120);
      const refreshId = window.setTimeout(() => {
        stepMetrics = measureSteps();
        ScrollTrigger.refresh();
        syncProgress();
      }, 450);

      const onResize = () => {
        stepMetrics = measureSteps();
        ScrollTrigger.refresh();
        syncProgress();
      };
      window.addEventListener('resize', onResize);

      return () => {
        window.clearTimeout(layoutId);
        window.clearTimeout(refreshId);
        window.removeEventListener('resize', onResize);
      };
    }, section);

    return () => ctx.revert();
  }, [loading, stepCount]);

  if (!process) return null;

  return (
    <section
      ref={sectionRef}
      id="process"
      className={styles.processSection}
      style={{ height: sectionHeight }}
    >
      <div className={styles.processSticky}>
        <div className={styles.processCard}>
          <header className={styles.processHeader}>
            <p className={styles.processEyebrow}>{process.eyebrow}</p>
            <h2 className={styles.processTitle}>{process.title}</h2>
            {process.subtitle ? <p className={styles.processSubtitle}>{process.subtitle}</p> : null}
          </header>

          <div ref={timelineRef} className={styles.timeline}>
            <div ref={highlightRef} className={styles.highlightBar} aria-hidden="true" />

            <div className={styles.timelineLine}>
              <span className={styles.timelineGlow} />
            </div>

            <ol className={styles.timelineList}>
              {steps.map((step, index) => (
                <TimelineStep
                  key={step.num || index}
                  step={step}
                  index={index}
                  stepRef={(el) => {
                    stepRefs.current[index] = el;
                  }}
                />
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
