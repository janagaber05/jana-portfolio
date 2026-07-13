import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSiteContent } from '../context/SiteContentContext';
import styles from './DisciplinesSection.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function DisciplinesSection() {
  const { content } = useSiteContent();
  const disciplines = content?.disciplines;
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.from('.discipline-panel-main', {
        y: 48,
        autoAlpha: 0,
        duration: 0.85,
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
        stagger: 0.06,
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

  if (!disciplines?.ux) return null;

  const { ux } = disciplines;

  return (
    <section ref={sectionRef} id="disciplines" className={styles.disciplines}>
      <div className={`discipline-panel-main ${styles.panelMain}`}>
        <span className={styles.ghostNumber} aria-hidden="true">
          {ux.ghostNumber}
        </span>

        <div className={styles.panelInner}>
          <div className={styles.panelTop}>
            <p className={styles.disciplineLabel}>{ux.label}</p>
            <h2 className={styles.panelTitle}>{ux.title}</h2>
          </div>

          <div className={styles.panelBottom}>
            <ul className={styles.skillList}>
              {ux.skills.map((skill) => (
                <li key={skill}>
                  <span className={`discipline-tag ${styles.skillTag}`}>
                    {skill}
                  </span>
                </li>
              ))}
            </ul>
            <a href={ux.linkHref} className={styles.panelLink}>
              <span className={styles.arrowBtn} aria-hidden="true">
                →
              </span>
              <span>{ux.linkText}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
