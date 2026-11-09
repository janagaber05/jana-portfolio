import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getCaseStudy } from '../data/caseStudies';
import { getAdjacentProjects, getProjectBySlug } from '../data/featuredWork';
import { useSiteContent } from '../context/SiteContentContext';
import { isProjectPublished } from '../utils/publishFilters';
import { cleanupScrollEffects } from '../utils/scrollCleanup';
import {
  getScreenImageSrc,
  getScreenLightboxSrc,
  getVisibleProgressSections,
  shouldRenderCaseStudySection,
} from '../utils/caseStudyImage';
import { resolveWalkthroughVideo } from '../utils/walkthroughVideo';
import {
  getCoverImage,
  getProjectTheme,
  truncateText,
} from '../utils/projectTheme';
import ImageLightbox from '../components/ImageLightbox';
import VelocityTapes from '../components/fx/VelocityTapes';
import BeforeAfterSlider from '../components/case-study/BeforeAfterSlider';
import DeviceFrame from '../components/case-study/DeviceFrame';
import InsightFlipCard from '../components/case-study/InsightFlipCard';
import MetricCountUp from '../components/case-study/MetricCountUp';
import NextProjectStrip from '../components/case-study/NextProjectStrip';
import PersonaIdCard from '../components/case-study/PersonaIdCard';
import PinnedScreenGallery from '../components/case-study/PinnedScreenGallery';
import ProcessMorph from '../components/case-study/ProcessMorph';
import SlipFlipOverlay from '../components/case-study/SlipFlipOverlay';
import styles from './ProjectPage.module.css';
import './ProjectExhibit.css';

gsap.registerPlugin(ScrollTrigger);

function HighlightTitle({ title, highlight, className }) {
  if (!title) return null;
  const needle = String(highlight || '').trim();
  if (!needle) return <h2 className={className}>{title}</h2>;
  const regex = new RegExp(`(${needle})`, 'i');
  const parts = title.split(regex);
  return (
    <h2 className={className}>
      {parts.map((part, index) => (
        part.toLowerCase() === needle.toLowerCase() ? (
          // eslint-disable-next-line react/no-array-index-key
          <span key={index} className="cs-hl">{part}</span>
        ) : part
      ))}
    </h2>
  );
}

function useSectionSpy(sectionIds) {
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const elements = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
    if (!elements.length) return undefined;
    const ratios = new Array(elements.length).fill(0);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = elements.indexOf(entry.target);
        if (index === -1) return;
        ratios[index] = entry.isIntersecting ? entry.intersectionRatio : 0;
      });
      const bestIndex = ratios.reduce((best, ratio, index) => (
        ratio > ratios[best] ? index : best
      ), 0);
      if (ratios[bestIndex] > 0) setActiveIndex(bestIndex);
    }, {
      threshold: [0, 0.15, 0.35, 0.55, 0.75, 1],
      rootMargin: '-20% 0px -35% 0px',
    });
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionIds]);

  return activeIndex;
}

function toLightboxItem(label, src, alt) {
  if (!src) return null;
  return { src, label, alt: alt || label || '' };
}

export default function ProjectPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const { content, mergedContent, loading, isPreview } = useSiteContent();
  const projects = mergedContent?.featuredWork?.projects || [];
  const project = getProjectBySlug(projects, slug);
  const caseStudy = getCaseStudy(project, mergedContent?.caseStudies);
  const publishedProjects = content?.featuredWork?.projects || [];
  const { next } = getAdjacentProjects(publishedProjects, slug);
  const nextCaseStudy = next ? getCaseStudy(next, mergedContent?.caseStudies) : null;
  const walkthroughVideo = resolveWalkthroughVideo(caseStudy?.walkthrough?.videoUrl);
  const progressSections = useMemo(
    () => getVisibleProgressSections(caseStudy, walkthroughVideo),
    [caseStudy, walkthroughVideo],
  );
  const sectionIds = progressSections.map((section) => section.id);
  const activeSection = useSectionSpy(sectionIds);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const scrollKey = `jana:projectScroll:${slug}`;
  const theme = getProjectTheme(project?.accent);
  const cover = getCoverImage(caseStudy, project);

  const showOverview = shouldRenderCaseStudySection(caseStudy, 'overview');
  const showRole = shouldRenderCaseStudySection(caseStudy, 'myRole');
  const showResearch = shouldRenderCaseStudySection(caseStudy, 'research');
  const showQuote = shouldRenderCaseStudySection(caseStudy, 'quote');
  const showBeforeAfter = shouldRenderCaseStudySection(caseStudy, 'beforeAfter');
  const showWalkthrough = shouldRenderCaseStudySection(caseStudy, 'walkthrough', { walkthroughVideo });
  const showProcess = shouldRenderCaseStudySection(caseStudy, 'designProcess');
  const showFinal = shouldRenderCaseStudySection(caseStudy, 'finalDesign');
  const showOutcomes = shouldRenderCaseStudySection(caseStudy, 'outcomes');
  const showReflection = shouldRenderCaseStudySection(caseStudy, 'reflection');
  const metrics = (caseStudy?.outcomes?.metrics || []).filter((m) => m?.value || m?.label);
  const tldrMetrics = metrics.slice(0, 3);

  const storyChapters = useMemo(() => ([
    showOverview && { id: 'section-overview', label: 'Problem' },
    showRole && { id: 'section-role', label: 'My role' },
    showResearch && { id: 'section-research', label: 'Research' },
    showProcess && { id: 'section-process', label: 'Process' },
    showFinal && { id: 'section-final', label: 'Solution' },
  ].filter(Boolean)), [showOverview, showRole, showResearch, showProcess, showFinal]);

  useEffect(() => {
    setLightboxIndex(null);
  }, [slug]);

  useEffect(() => {
    if (loading || !project) return undefined;
    let cancelled = false;
    const saved = Number(sessionStorage.getItem(scrollKey) || 0);
    const apply = (y) => {
      window.scrollTo({ top: y, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = y;
      document.body.scrollTop = y;
    };
    if (saved > 0) {
      apply(saved);
      const t1 = window.setTimeout(() => { if (!cancelled) apply(saved); }, 50);
      const t2 = window.setTimeout(() => { if (!cancelled) apply(saved); }, 250);
      return () => {
        cancelled = true;
        window.clearTimeout(t1);
        window.clearTimeout(t2);
      };
    }
    apply(0);
    return undefined;
  }, [loading, project, scrollKey, slug]);

  useEffect(() => {
    if (loading || !project) return undefined;
    let timerId = 0;
    const persist = () => {
      try {
        sessionStorage.setItem(
          scrollKey,
          String(window.scrollY || document.documentElement.scrollTop || 0),
        );
      } catch {
        // ignore
      }
    };
    const onScroll = () => {
      window.clearTimeout(timerId);
      timerId = window.setTimeout(persist, 80);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', persist);
    window.addEventListener('beforeunload', persist);
    return () => {
      window.clearTimeout(timerId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', persist);
      window.removeEventListener('beforeunload', persist);
      persist();
    };
  }, [loading, project, scrollKey]);

  useEffect(() => {
    const root = pageRef.current;
    if (!root || !project) return undefined;
    const ctx = gsap.context(() => {
      const chars = root.querySelectorAll('[data-hero-char]');
      if (chars.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.fromTo(chars, { y: 40, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.03,
          ease: 'power3.out',
          delay: 0.15,
        });
      }
      const facts = root.querySelectorAll('[data-fact]');
      if (facts.length) {
        gsap.fromTo(facts, { y: 18, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.55,
          stagger: 0.08,
          ease: 'power2.out',
          delay: 0.45,
        });
      }
      const mark = root.querySelector('[data-watermark]');
      if (mark && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.to(mark, {
          xPercent: 4, yPercent: -3, duration: 10, yoyo: true, repeat: -1, ease: 'sine.inOut',
        });
      }
    }, root);

    const refresh = () => ScrollTrigger.refresh();
    const t = window.setTimeout(refresh, 500);
    window.addEventListener('load', refresh);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('load', refresh);
      ctx.revert();
    };
  }, [project, slug]);

  const goHome = (event) => {
    event.preventDefault();
    cleanupScrollEffects();
    navigate('/#work');
  };

  const goToProject = (event, targetSlug) => {
    event.preventDefault();
    cleanupScrollEffects();
    try {
      sessionStorage.removeItem(`jana:projectScroll:${targetSlug}`);
    } catch {
      // ignore
    }
    navigate(`/work/${targetSlug}`);
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const lightboxItems = useMemo(() => {
    if (!caseStudy) return [];
    const items = [];
    (caseStudy.finalDesign?.screens || []).forEach((screen, index) => {
      const item = toLightboxItem(
        screen.label || `Screen ${index + 1}`,
        getScreenLightboxSrc(screen),
        screen.alt,
      );
      if (item) items.push(item);
    });
    (caseStudy.designProcess?.stages || []).forEach((stage, index) => {
      const item = toLightboxItem(
        stage.label || `Stage ${index + 1}`,
        getScreenLightboxSrc(stage),
        stage.alt,
      );
      if (item) items.push(item);
    });
    return items;
  }, [caseStudy]);

  const openScreenLightbox = (screen) => {
    const src = getScreenLightboxSrc(screen);
    const index = lightboxItems.findIndex((item) => item.src === src);
    if (index >= 0) setLightboxIndex(index);
  };

  if (loading) {
    return <div className={styles.page} aria-busy="true" />;
  }

  if (!project || !caseStudy) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <Link to="/work" className={styles.notFoundLink} onClick={cleanupScrollEffects}>← Back to work</Link>
          <h1>Project not found</h1>
          <p>We couldn&apos;t find a project at <code>/work/{slug}</code>.</p>
        </div>
      </div>
    );
  }

  if (!isProjectPublished(project) && !isPreview) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <Link to="/work" className={styles.notFoundLink} onClick={cleanupScrollEffects}>← Back to work</Link>
          <h1>{project.title}</h1>
          <p>This project isn&apos;t published yet.</p>
        </div>
      </div>
    );
  }

  const titleChars = Array.from(project.title || '');

  return (
    <div
      key={slug}
      ref={pageRef}
      className={`${styles.page} cs-page`}
      style={{
        '--accent': theme.accent,
        '--on-accent': theme.onAccent,
        '--ink': theme.ink,
        '--cream': theme.cream,
        '--pink': theme.pink,
      }}
    >
      <SlipFlipOverlay slug={slug} title={project.title} />

      <nav className="cs-progress" aria-label="Case study progress">
        {progressSections.map((section, index) => (
          <button
            key={section.id}
            type="button"
            className={`cs-progress-dot${activeSection === index ? ' is-active' : ''}`}
            aria-label={section.label}
            aria-current={activeSection === index ? 'step' : undefined}
            onClick={() => scrollToSection(section.id)}
          >
            <span className="cs-progress-tip">{section.label}</span>
          </button>
        ))}
      </nav>

      <section className="cs-hero" aria-label="Project hero">
        <span className="cs-hero-watermark" data-watermark aria-hidden="true">
          {caseStudy.abbreviation || project.title?.slice(0, 3)?.toUpperCase()}
        </span>
        <div className="cs-hero-grid">
          <div className="cs-hero-copy">
            <p className="cs-kicker">Case study · {project.index || '01'}</p>
            <h1 className="cs-hero-title" aria-label={project.title}>
              {titleChars.map((char, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <span key={`${char}-${index}`} data-hero-char>
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </h1>
            {project.summary ? <p className="cs-hero-summary">{project.summary}</p> : null}
            <Link to="/#work" className="cs-back" data-magnetic onClick={goHome}>
              ← back to work
            </Link>
          </div>
          <div className="cs-hero-media">
            {cover ? (
              <DeviceFrame
                src={cover}
                alt={`${project.title} cover`}
                priority
                tilt
                bob
                onClick={() => {
                  const first = caseStudy.finalDesign?.screens?.find((s) => getScreenImageSrc(s));
                  if (first) openScreenLightbox(first);
                }}
              />
            ) : null}
          </div>
        </div>

        <div className="cs-ticket" aria-label="Project facts">
          {[
            ['Role', caseStudy.facts?.role],
            ['Timeline', caseStudy.facts?.timeline],
            ['Tools', caseStudy.facts?.tools],
            ['Type', caseStudy.facts?.type],
          ].filter(([, v]) => v).map(([label, value]) => (
            <div key={label} className="cs-ticket-cell" data-fact>
              <span className="cs-ticket-label">{label}</span>
              <span className="cs-ticket-value">{value}</span>
            </div>
          ))}
          <div className="cs-ticket-meta" aria-hidden="true">
            <span className="cs-ticket-barcode">||||| || |||||</span>
            <span>{project.index || '01'}</span>
          </div>
        </div>
        <p className="cs-scroll-cue" aria-hidden="true">scroll</p>
      </section>

      {tldrMetrics.length ? (
        <section className="cs-tldr" aria-label="Results at a glance">
          <div className="cs-tldr-metrics">
            {tldrMetrics.map((metric) => (
              <MetricCountUp
                key={`${metric.value}-${metric.label}`}
                value={metric.value}
                label={metric.label}
                className="cs-tldr-card"
              />
            ))}
          </div>
          <div className="cs-tldr-copy">
            {caseStudy.overview?.problemText ? (
              <p><strong>Problem:</strong> {truncateText(caseStudy.overview.problemText)}</p>
            ) : null}
            {caseStudy.overview?.solutionText ? (
              <p><strong>Solution:</strong> {truncateText(caseStudy.overview.solutionText)}</p>
            ) : null}
          </div>
        </section>
      ) : null}

      {showFinal ? (
        <PinnedScreenGallery
          screens={caseStudy.finalDesign.screens}
          onInspect={openScreenLightbox}
        />
      ) : null}

      {(() => {
        const fallbackTools = [
          caseStudy.facts?.tools,
          ...(project.tools || []),
        ]
          .filter(Boolean)
          .join(' · ');
        const top = String(caseStudy.strips?.top || fallbackTools || '')
          .replace(/[,|/]+/g, ' · ')
          .replace(/\s+·\s+/g, ' · ')
          .trim();
        const bottom = String(
          caseStudy.strips?.bottom || 'UX · UI · RESEARCH · PROTOTYPE · MOTION',
        )
          .replace(/[,|/]+/g, ' · ')
          .replace(/\s+·\s+/g, ' · ')
          .trim();
        if (!top && !bottom) return null;
        return (
          <VelocityTapes
            text={top || bottom}
            altText={bottom || top}
            from={(tldrMetrics.length || showFinal) ? '#141214' : theme.accent}
            to="#FCF4F0"
          />
        );
      })()}

      {(showOverview || showRole || showResearch) ? (
        <section className="cs-story">
          {storyChapters.length ? (
            <aside className="cs-story-index" aria-label="Chapter index">
              <ol>
                {storyChapters.map((chapter, index) => (
                  <li key={chapter.id}>
                    <button
                      type="button"
                      className={progressSections[activeSection]?.id === chapter.id ? 'is-active' : ''}
                      onClick={() => scrollToSection(chapter.id)}
                    >
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      {chapter.label}
                    </button>
                  </li>
                ))}
              </ol>
            </aside>
          ) : null}

          <div className="cs-story-main">
            {showOverview ? (
              <div id="section-overview" className="cs-chapter">
                <p className="cs-kicker">{caseStudy.overview.sectionNumber || '01'} — Overview</p>
                <HighlightTitle
                  title={caseStudy.overview.title}
                  highlight={caseStudy.overview.highlight}
                  className="cs-chapter-title"
                />
                <div className="cs-two">
                  <article className="cs-card">
                    <p className="cs-card-label">{caseStudy.overview.problemLabel || 'Problem'}</p>
                    <h3>{caseStudy.overview.problemTitle}</h3>
                    <p>{caseStudy.overview.problemText}</p>
                  </article>
                  <article className="cs-card">
                    <p className="cs-card-label">{caseStudy.overview.solutionLabel || 'Solution'}</p>
                    <h3>{caseStudy.overview.solutionTitle}</h3>
                    <p>{caseStudy.overview.solutionText}</p>
                  </article>
                </div>
              </div>
            ) : null}

            {showRole ? (
              <div id="section-role" className="cs-chapter">
                <p className="cs-kicker">{caseStudy.myRole.sectionNumber || '02'} — My role</p>
                <HighlightTitle
                  title={caseStudy.myRole.title}
                  highlight={caseStudy.myRole.highlight}
                  className="cs-chapter-title"
                />
                {caseStudy.myRole.intro ? <p className="cs-body">{caseStudy.myRole.intro}</p> : null}
                <ul className="cs-pills">
                  {(caseStudy.myRole.pills || []).filter(Boolean).map((pill) => (
                    <li key={pill} data-magnetic>{pill}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {showResearch ? (
              <div id="section-research" className="cs-chapter">
                <p className="cs-kicker">{caseStudy.research.sectionNumber || '03'} — Research</p>
                <HighlightTitle
                  title={caseStudy.research.title}
                  highlight={caseStudy.research.highlight}
                  className="cs-chapter-title"
                />
                <div className="cs-flip-grid">
                  {(caseStudy.research.insights || []).filter((i) => i?.title || i?.text).map((insight) => (
                    <InsightFlipCard
                      key={`${insight.number}-${insight.title}`}
                      number={insight.number}
                      title={insight.title}
                      text={insight.text}
                    />
                  ))}
                </div>
                <div className="cs-persona-row">
                  {(caseStudy.research.personas || []).map((persona, index) => (
                    <PersonaIdCard key={`${persona?.name || 'p'}-${index}`} persona={persona} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {showQuote ? (
        <section id="section-quote" className="cs-quote">
          <blockquote>
            <p>{caseStudy.quote.text}</p>
            {caseStudy.quote.attribution ? <cite>{caseStudy.quote.attribution}</cite> : null}
          </blockquote>
        </section>
      ) : null}

      {showBeforeAfter ? (
        <section id="section-before-after" className="cs-section">
          <p className="cs-kicker">Before / After</p>
          <BeforeAfterSlider
            before={caseStudy.beforeAfter.before}
            after={caseStudy.beforeAfter.after}
            caption={caseStudy.beforeAfter.caption}
          />
        </section>
      ) : null}

      {showProcess ? (
        <ProcessMorph
          stages={caseStudy.designProcess.stages}
          onInspect={openScreenLightbox}
        />
      ) : null}

      {showWalkthrough ? (
        <section id="section-walkthrough" className="cs-section cs-walk">
          <p className="cs-kicker">{caseStudy.walkthrough?.sectionNumber || '04'} — Walkthrough</p>
          <HighlightTitle
            title={caseStudy.walkthrough?.title || 'Project walkthrough.'}
            highlight={caseStudy.walkthrough?.highlight || 'walkthrough'}
            className="cs-chapter-title"
          />
          <div className="cs-walk-frame">
            {walkthroughVideo.type === 'iframe' ? (
              <iframe
                src={walkthroughVideo.src}
                title={walkthroughVideo.title}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <InViewVideo
                src={walkthroughVideo.src}
                poster={caseStudy.walkthrough?.posterUrl || undefined}
              />
            )}
          </div>
          {caseStudy.walkthrough?.caption ? (
            <p className="cs-ba-caption">{caseStudy.walkthrough.caption}</p>
          ) : null}
        </section>
      ) : null}

      {showOutcomes ? (
        <section id="section-outcomes" className="cs-outcomes">
          <p className="cs-kicker cs-kicker-light">
            {caseStudy.outcomes.sectionNumber || '07'} — Outcomes
          </p>
          <HighlightTitle
            title={caseStudy.outcomes.title}
            highlight={caseStudy.outcomes.highlight}
            className="cs-chapter-title cs-chapter-title-light"
          />
          <div className="cs-outcome-grid">
            {metrics.map((metric) => (
              <MetricCountUp
                key={`${metric.value}-${metric.label}`}
                value={metric.value}
                label={metric.label}
                className="cs-outcome-card"
              />
            ))}
          </div>
        </section>
      ) : null}

      {showReflection ? (
        <section id="section-reflection" className="cs-reflection">
          <h2>{caseStudy.reflection?.title || "What I'd do differently"}</h2>
          <p>{caseStudy.reflection.text}</p>
        </section>
      ) : null}

      <NextProjectStrip
        next={next}
        nextCaseStudy={nextCaseStudy}
        onNavigate={goToProject}
      />

      <ImageLightbox
        items={lightboxItems}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChangeIndex={setLightboxIndex}
      />
    </div>
  );
}

function InViewVideo({ src, poster }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) el.play().catch(() => {});
      else el.pause();
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
    />
  );
}
