import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import heroImage from '../assets/jana hero.png';
import { useSiteContent } from '../context/SiteContentContext';
import { resolveMediaUrl } from '../utils/mediaUrl';
import { safeHref } from '../utils/safeUrl';
import styles from './AboutSection.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function AboutSection() {
  const { content } = useSiteContent();
  const about = content?.about;
  const contact = content?.contact;
  const aboutRef = useRef(null);

  const resumeHref = contact?.resumeUrl
    ? resolveMediaUrl(contact.resumeUrl)
    : '';
  const canDownloadCv = Boolean(resumeHref && contact?.showResume !== false);
  const primaryHref = safeHref(canDownloadCv ? resumeHref : (about?.ctaPrimaryHref || '#'));
  const primaryLabel = about?.ctaPrimary || 'Download CV →';
  const secondaryHref = safeHref(about?.ctaSecondaryHref || '#');

  useEffect(() => {
    const section = aboutRef.current;
    if (!section || !about) return undefined;

    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      gsap.set('.about-label', { autoAlpha: 0, y: 12 });
      gsap.set('.about-headline', { autoAlpha: 0, y: 28 });
      gsap.set('.about-divider', { scaleX: 0, transformOrigin: 'left center' });
      gsap.set('.about-para-1', { autoAlpha: 0, y: 14 });
      gsap.set('.about-para-2', { autoAlpha: 0, y: 14 });
      gsap.set('.about-stat', { autoAlpha: 0, y: 16 });
      gsap.set('.about-actions', { autoAlpha: 0, y: 12 });
      gsap.set('.about-photo', { autoAlpha: 0, y: 24 });
      gsap.set('.about-float-card', { autoAlpha: 0, y: 18 });
      gsap.set('.about-badge', { autoAlpha: 0, y: -8 });

      if (reduceMotion) {
        gsap.set(
          section.querySelectorAll(
            '.about-label, .about-headline, .about-para-1, .about-para-2, .about-stat, .about-actions, .about-photo, .about-float-card, .about-badge',
          ),
          { autoAlpha: 1, x: 0, y: 0 },
        );
        gsap.set(section.querySelectorAll('.about-divider'), { scaleX: 1 });
        return;
      }

      const aboutTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 78%',
          toggleActions: 'play none none none',
        },
      });

      aboutTl
        .to('.about-label', {
          autoAlpha: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
        })
        .to(
          '.about-headline',
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
          },
          '-=0.1',
        )
        .addLabel('in')
        .to(
          '.about-photo',
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
          },
          'in',
        )
        .to(
          '.about-badge',
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out',
          },
          'in+=0.15',
        )
        .to(
          '.about-divider',
          {
            scaleX: 1,
            duration: 0.4,
            ease: 'power2.inOut',
          },
          'in+=0.2',
        )
        .to(
          '.about-para-1',
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out',
          },
          'in+=0.25',
        )
        .to(
          '.about-para-2',
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out',
          },
          'in+=0.38',
        )
        .to(
          '.about-stat',
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.35,
            ease: 'power2.out',
            stagger: 0.08,
          },
          'in+=0.5',
        )
        .to(
          '.about-actions',
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out',
          },
          'in+=0.65',
        )
        .to(
          '.about-float-card',
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.45,
            ease: 'power2.out',
          },
          'in+=0.45',
        );
    }, section);

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.8) {
        gsap.set(
          section.querySelectorAll(
            '.about-label, .about-headline, .about-para-1, .about-para-2, .about-stat, .about-actions, .about-photo, .about-float-card, .about-badge',
          ),
          { autoAlpha: 1, x: 0, y: 0 },
        );
        gsap.set(section.querySelectorAll('.about-divider'), { scaleX: 1 });
      }
    });

    return () => ctx.revert();
  }, [about]);

  if (!about) return null;

  const photoSrc = resolveMediaUrl(about.photo, heroImage) || heroImage;

  return (
    <section id="about" ref={aboutRef} className={styles.about}>
      <div className={styles.aboutLeft}>
        <div className={styles.aboutLeftInner}>
          <p className={`about-label ${styles.aboutLabel}`}>{about.label}</p>

          <h2 className={`about-headline ${styles.aboutHeadline}`}>
            {about.headline}{' '}
            <span className={styles.aboutHighlight}>{about.headlineHighlight}</span>
          </h2>

          <div className={`about-divider ${styles.aboutDivider}`} aria-hidden="true" />

          <div className={styles.aboutBody}>
            <p className={`about-para-1 ${styles.aboutParagraph}`}>{about.paragraph1}</p>
            <p className={`about-para-2 ${styles.aboutParagraph}`}>{about.paragraph2}</p>
          </div>

          <div className={styles.aboutStats}>
            {about.stats.map((stat) => (
              <div key={stat.label} className={`about-stat ${styles.aboutStat}`}>
                <span className={styles.aboutStatValue}>{stat.value}</span>
                <span className={styles.aboutStatLabel}>{stat.label}</span>
              </div>
            ))}
          </div>

          <div className={`about-actions ${styles.aboutActions}`}>
            {canDownloadCv ? (
              <a
                href={primaryHref}
                className={styles.aboutCtaPrimary}
                download
                target="_blank"
                rel="noopener noreferrer"
              >
                {primaryLabel}
              </a>
            ) : (
              <a href={primaryHref} className={styles.aboutCtaPrimary}>
                {primaryLabel}
              </a>
            )}
            <a href={secondaryHref} className={styles.aboutCtaGhost}>
              {about.ctaSecondary}
            </a>
          </div>
        </div>
      </div>

      <div className={styles.aboutRight}>
        <span className={styles.aboutWatermark} aria-hidden="true">
          {about.watermark}
        </span>
        <span className={`about-badge ${styles.aboutBadge}`}>{about.badge}</span>

        <div className={styles.aboutPhotoWrap}>
          <img
            className={`about-photo ${styles.aboutPhoto}`}
            src={photoSrc}
            alt="Jana"
            draggable={false}
          />
          <div className={`about-float-card ${styles.aboutFloatCard}`}>
            <span className={styles.aboutFloatLabel}>{about.floatLabel}</span>
            <strong className={styles.aboutFloatValue}>{about.floatValue}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
