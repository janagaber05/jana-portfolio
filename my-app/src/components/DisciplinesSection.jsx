import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSiteContent } from '../context/SiteContentContext';
import styles from './DisciplinesSection.module.css';

gsap.registerPlugin(ScrollTrigger);

function DisciplinePanel({
  panel,
  className,
  ghostClassName,
  labelClassName,
  titleClassName,
  tagClassName,
  linkClassName,
  arrowClassName,
  onEnter,
  onLeave,
}) {
  return (
    <div
      className={className}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
    >
      <span className={ghostClassName} aria-hidden="true">
        {panel.ghostNumber}
      </span>

      <div className={styles.panelInner}>
        <div className={styles.panelTop}>
          <p className={labelClassName}>{panel.label}</p>
          <h2 className={titleClassName}>{panel.title}</h2>
        </div>

        <div className={styles.panelBottom}>
          <ul className={styles.skillList}>
            {panel.skills.map((skill) => (
              <li key={skill}>
                <span className={`discipline-tag ${tagClassName}`}>{skill}</span>
              </li>
            ))}
          </ul>
          <a href={panel.linkHref} className={linkClassName}>
            <span className={arrowClassName} aria-hidden="true">
              →
            </span>
            <span>{panel.linkText}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function DisciplinesSection() {
  const { content } = useSiteContent();
  const disciplines = content?.disciplines;
  const sectionRef = useRef(null);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.from('.discipline-panel-left, .discipline-panel-right', {
        y: 48,
        autoAlpha: 0,
        duration: 0.85,
        stagger: 0.12,
        ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });

      gsap.from('.discipline-tag', {
        autoAlpha: 0,
        y: 12,
        duration: 0.35,
        stagger: 0.04,
        ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }, section);

    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, []);

  if (!disciplines?.ux || !disciplines?.graphic) return null;

  const { ux, graphic } = disciplines;
  const panelFlexLeft = hovered === 'graphic' ? 0.62 : hovered === 'ux' ? 1.38 : 1;
  const panelFlexRight = hovered === 'ux' ? 0.62 : hovered === 'graphic' ? 1.38 : 1;

  return (
    <section
      ref={sectionRef}
      id="disciplines"
      className={styles.disciplines}
      style={{
        '--panel-flex-left': panelFlexLeft,
        '--panel-flex-right': panelFlexRight,
      }}
    >
      <div className={styles.panels}>
        <DisciplinePanel
          panel={ux}
          className={`discipline-panel-left ${styles.panelLeft}`}
          ghostClassName={`${styles.ghostNumber} ${styles.ghostNumberLeft}`}
          labelClassName={styles.disciplineLabel}
          titleClassName={styles.panelTitle}
          tagClassName={`${styles.skillTag} ${styles.skillTagLeft}`}
          linkClassName={styles.panelLink}
          arrowClassName={`${styles.arrowBtn} ${styles.arrowBtnLeft}`}
          onEnter={() => setHovered('ux')}
          onLeave={() => setHovered(null)}
        />

        <div className={styles.centerLine} aria-hidden="true" />

        <DisciplinePanel
          panel={graphic}
          className={`discipline-panel-right ${styles.panelRight}`}
          ghostClassName={`${styles.ghostNumber} ${styles.ghostNumberRight}`}
          labelClassName={`${styles.disciplineLabel} ${styles.disciplineLabelRight}`}
          titleClassName={`${styles.panelTitle} ${styles.panelTitleRight}`}
          tagClassName={`${styles.skillTag} ${styles.skillTagRight}`}
          linkClassName={`${styles.panelLink} ${styles.panelLinkRight}`}
          arrowClassName={`${styles.arrowBtn} ${styles.arrowBtnRight}`}
          onEnter={() => setHovered('graphic')}
          onLeave={() => setHovered(null)}
        />
      </div>
    </section>
  );
}
