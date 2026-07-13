import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSiteContent } from '../context/SiteContentContext';
import styles from './ProcessSection.module.css';

gsap.registerPlugin(ScrollTrigger);

const THEME_CLASS = {
  burgundy: styles.themeBurgundy,
  dark: styles.themeDark,
  petal: styles.themePetal,
};

const SIZE_CLASS = {
  hero: styles.sizeHero,
  medium: styles.sizeMedium,
  small: styles.sizeSmall,
};

function ProcessCard({ step, className = '' }) {
  const cardRef = useRef(null);
  const hoverRef = useRef(null);
  const hoverTlRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    const hover = hoverRef.current;
    if (!card || !hover) return;

    const label = hover.querySelector('[data-hover="label"]');
    const title = hover.querySelector('[data-hover="title"]');
    const divider = hover.querySelector('[data-hover="divider"]');
    const description = hover.querySelector('[data-hover="description"]');
    const tags = hover.querySelector('[data-hover="tags"]');
    const targets = [label, title, divider, description, tags].filter(Boolean);

    gsap.set(targets, { autoAlpha: 0, y: 10 });
    gsap.set(divider, { scaleX: 0, transformOrigin: 'left center' });

    const playHover = () => {
      hoverTlRef.current?.kill();
      hoverTlRef.current = gsap
        .timeline()
        .to(label, { autoAlpha: 1, y: 0, duration: 0.12, ease: 'power2.out' }, 0)
        .to(title, { autoAlpha: 1, y: 0, duration: 0.12, ease: 'power2.out' }, 0.07)
        .to(divider, { scaleX: 1, autoAlpha: 1, duration: 0.14, ease: 'power2.inOut' }, 0.14)
        .to(description, { autoAlpha: 1, y: 0, duration: 0.12, ease: 'power2.out' }, 0.21)
        .to(tags, { autoAlpha: 1, y: 0, duration: 0.12, ease: 'power2.out' }, 0.28);
    };

    const resetHover = () => {
      hoverTlRef.current?.kill();
      gsap.set(targets, { autoAlpha: 0, y: 10 });
      gsap.set(divider, { scaleX: 0 });
    };

    const onEnter = () => playHover();
    const onLeave = () => resetHover();

    card.addEventListener('mouseenter', onEnter);
    card.addEventListener('mouseleave', onLeave);
    card.addEventListener('focusin', onEnter);
    card.addEventListener('focusout', onLeave);

    return () => {
      card.removeEventListener('mouseenter', onEnter);
      card.removeEventListener('mouseleave', onLeave);
      card.removeEventListener('focusin', onEnter);
      card.removeEventListener('focusout', onLeave);
      hoverTlRef.current?.kill();
    };
  }, []);

  return (
    <article
      ref={cardRef}
      className={`${styles.stepCard} ${THEME_CLASS[step.theme]} ${SIZE_CLASS[step.size]} ${className}`}
      tabIndex={0}
    >
      <span className={styles.ghostNum} aria-hidden="true">
        {step.num}
      </span>

      <div className={styles.cardBase}>
        <div className={styles.cardBaseFooter}>
          <div className={styles.bottomGradient} aria-hidden="true" />
          <p className={styles.baseStepLabel}>Step {step.num}</p>
          <h3 className={styles.baseTitle}>{step.title}</h3>
        </div>
      </div>

      <div ref={hoverRef} className={styles.cardHover}>
        <p className={styles.hoverStepLabel} data-hover="label">
          Step {step.num}
        </p>
        <h3 className={styles.hoverTitle} data-hover="title">
          {step.title}
        </h3>
        <div className={styles.hoverDivider} data-hover="divider" aria-hidden="true" />
        <p className={styles.hoverDescription} data-hover="description">
          {step.description}
        </p>
        <ul className={styles.hoverTags} data-hover="tags">
          {step.tags.map((tag) => (
            <li key={tag}>
              <span className={styles.hoverTag}>{tag}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default function ProcessSection() {
  const { content } = useSiteContent();
  const process = content?.process;
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.from(section, {
        autoAlpha: 0,
        y: 40,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  if (!process) return null;

  const { steps } = process;

  return (
    <section ref={sectionRef} id="process" className={styles.processSection}>
      <div className={styles.processInner}>
        <header className={styles.processHeader}>
          <div className={styles.processHeaderLeft}>
            <p className={styles.processEyebrow}>{process.eyebrow}</p>
            <h2 className={styles.processTitle}>
              <span className={styles.processTitleDark}>{process.titleDark}</span>
              <span className={styles.processTitleAccent}>{process.titleAccent}</span>
            </h2>
          </div>
          <p className={styles.processMeta}>{process.meta}</p>
        </header>

        <div className={styles.stepsGrid}>
          <ProcessCard step={steps.discover} className={styles.layoutHero} />
          <ProcessCard step={steps.define} className={styles.layoutDefine} />
          <div className={styles.layoutPair}>
            <ProcessCard step={steps.design} />
            <ProcessCard step={steps.deliver} />
          </div>
        </div>
      </div>
    </section>
  );
}
