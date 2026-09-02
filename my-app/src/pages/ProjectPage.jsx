import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getCaseStudy } from '../data/caseStudies';
import { getAdjacentProjects, getProjectBySlug } from '../data/featuredWork';
import { useSiteContent } from '../context/SiteContentContext';
import { isProjectPublished } from '../utils/publishFilters';
import { cleanupScrollEffects } from '../utils/scrollCleanup';
import { getResolvedImageSrc } from '../utils/resolveImageSources';
import {
  getScreenImageSrc,
  getScreenLightboxSrc,
  getVisibleProgressSections,
  isCaseStudySectionVisible,
} from '../utils/caseStudyImage';
import { resolveWalkthroughVideo } from '../utils/walkthroughVideo';
import ProjectBentoGrid, { GripIcon } from '../components/ProjectBentoGrid';
import CaseStudyScreenGallery from '../components/CaseStudyScreenGallery';
import ImageLightbox from '../components/ImageLightbox';
import styles from './ProjectPage.module.css';

function HighlightTitle({ title, highlight, className, highlightClassName }) {
  const regex = new RegExp(`(${highlight})`, 'i');
  const parts = title.split(regex);

  return (
    <h2 className={className}>
      {parts.map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={index} className={highlightClassName}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </h2>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.personIcon}>
      <circle cx="12" cy="8" r="4" fill="currentColor" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="currentColor" />
    </svg>
  );
}

function useSectionSpy(sectionIds) {
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!elements.length) return undefined;

    const ratios = new Array(elements.length).fill(0);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = elements.indexOf(entry.target);
          if (index === -1) return;
          ratios[index] = entry.isIntersecting ? entry.intersectionRatio : 0;
        });

        const bestIndex = ratios.reduce(
          (best, ratio, index) => (ratio > ratios[best] ? index : best),
          0,
        );

        if (ratios[bestIndex] > 0) {
          setActiveIndex(bestIndex);
        }
      },
      {
        threshold: [0, 0.15, 0.35, 0.55, 0.75, 1],
        rootMargin: '-20% 0px -35% 0px',
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [sectionIds]);

  return activeIndex;
}

function toLightboxItem(label, imageUrl, candidates, fallback, alt, fullImageUrl) {
  const displaySrc = getResolvedImageSrc(imageUrl, candidates, fallback);
  const fullSrc = fullImageUrl || displaySrc;
  if (!fullSrc) return null;
  return {
    src: fullSrc,
    label,
    alt: alt || label || '',
  };
}

export default function ProjectPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { content, mergedContent, loading, isPreview } = useSiteContent();
  const projects = mergedContent?.featuredWork?.projects || [];
  const project = getProjectBySlug(projects, slug);
  const caseStudy = getCaseStudy(project, mergedContent?.caseStudies);
  const publishedProjects = content?.featuredWork?.projects || [];
  const { next } = getAdjacentProjects(publishedProjects, slug);
  const walkthroughVideo = resolveWalkthroughVideo(caseStudy?.walkthrough?.videoUrl);
  const showWalkthrough = isCaseStudySectionVisible(caseStudy, 'walkthrough') && walkthroughVideo;
  const progressSections = getVisibleProgressSections(caseStudy, showWalkthrough ? walkthroughVideo : null);
  const sectionIds = progressSections.map((section) => section.id);
  const activeSection = useSectionSpy(sectionIds);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const scrollKey = `jana:projectScroll:${slug}`;

  useEffect(() => {
    setLightboxIndex(null);
  }, [slug]);

  // Restore scroll after content loads. Do not redirect while still loading.
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

  const heroScreens = useMemo(() => {
    if (!caseStudy) return [];
    const raw = caseStudy.heroScreens?.length
      ? caseStudy.heroScreens
      : (caseStudy.finalDesign?.screens || []);
    // Empty CMS slots used to render broken local placeholders and break the grid.
    return raw.filter((screen) => Boolean(getScreenImageSrc(screen)));
  }, [caseStudy]);

  const lightboxItems = useMemo(() => {
    if (!caseStudy || !project) return [];

    const items = [];

    heroScreens.forEach((screen, index) => {
      const item = toLightboxItem(
        screen.label || `Screen ${index + 1}`,
        getScreenImageSrc(screen),
        screen.imageCandidates,
        screen.fallbackImage,
        screen.alt,
        getScreenLightboxSrc(screen),
      );
      if (item) items.push(item);
    });

    (caseStudy.designProcess?.stages || []).forEach((stage, index) => {
      const item = toLightboxItem(
        stage.label || `Wireframe ${index + 1}`,
        getScreenImageSrc(stage),
        stage.imageCandidates,
        stage.fallbackImage,
        stage.alt,
        getScreenLightboxSrc(stage),
      );
      if (item) items.push(item);
    });

    (caseStudy.finalDesign?.screens || []).forEach((screen, index) => {
      const item = toLightboxItem(
        screen.label || `Final screen ${index + 1}`,
        getScreenImageSrc(screen),
        screen.imageCandidates,
        screen.fallbackImage,
        screen.alt,
        getScreenLightboxSrc(screen),
      );
      if (item) items.push(item);
    });

    return items;
  }, [caseStudy, project, heroScreens]);

  const openLightboxBySrc = (src) => {
    if (!src) return;
    const index = lightboxItems.findIndex((item) => item.src === src);
    if (index >= 0) setLightboxIndex(index);
  };

  const openLightboxItem = (label, imageUrl, candidates, fallback, alt, fullImageUrl) => {
    const item = toLightboxItem(label, imageUrl, candidates, fallback, alt, fullImageUrl);
    if (!item) return;
    openLightboxBySrc(item.src);
  };

  const openScreenLightbox = (screen) => {
    openLightboxItem(
      screen.label,
      getScreenImageSrc(screen),
      screen.imageCandidates,
      screen.fallbackImage,
      screen.alt,
      getScreenLightboxSrc(screen),
    );
  };

  if (loading) {
    return <div className={styles.page} aria-busy="true" />;
  }

  if (!project || !caseStudy) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <Link to="/work" className={styles.notFoundLink} onClick={cleanupScrollEffects}>
            ← Back to work
          </Link>
          <h1>Project not found</h1>
          <p>
            We couldn&apos;t find a project at <code>/work/{slug}</code>.
            It may have been renamed, removed, or not published yet.
          </p>
          <Link to="/" className={styles.notFoundLink} onClick={cleanupScrollEffects}>
            Go home
          </Link>
        </div>
      </div>
    );
  }

  if (!isProjectPublished(project) && !isPreview) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <Link to="/work" className={styles.notFoundLink} onClick={cleanupScrollEffects}>
            ← Back to work
          </Link>
          <h1>{project.title}</h1>
          <p>
            This project isn&apos;t published yet. Open the CMS and publish it to make the case study live.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <nav className={styles.progressNav} aria-label="Case study progress">
        {progressSections.map((section, index) => (
          <button
            key={section.id}
            type="button"
            className={`${styles.progressDot} ${activeSection === index ? styles.progressDotActive : ''}`}
            aria-label={section.label}
            aria-current={activeSection === index ? 'step' : undefined}
            onClick={() => scrollToSection(section.id)}
          />
        ))}
      </nav>

      {/* Section 1 — Hero */}
      <section className={styles.hero} aria-label="Project hero">
        <div className={styles.heroBody}>
          <span className={styles.heroWatermark} aria-hidden="true">
            {caseStudy.abbreviation}
          </span>

          <Link to="/#work" className={styles.heroBack} onClick={goHome}>
            ← Back to work
          </Link>

          <div className={styles.heroInner}>
            <div className={styles.heroContent}>
              <p className={styles.heroTag}>
                Case study · {project.index}
              </p>
              <div className={styles.heroTitleRow}>
                <h1 className={styles.heroTitle}>{project.title}</h1>
                <GripIcon className={styles.heroTitleGrip} />
              </div>

              <div className={styles.heroDivider} aria-hidden="true" />

              <dl className={styles.factStrip}>
                <div>
                  <dt>My role</dt>
                  <dd>{caseStudy.facts.role}</dd>
                </div>
                <div>
                  <dt>Timeline</dt>
                  <dd>{caseStudy.facts.timeline}</dd>
                </div>
                <div>
                  <dt>Tools</dt>
                  <dd>{caseStudy.facts.tools}</dd>
                </div>
                <div>
                  <dt>Type</dt>
                  <dd>{caseStudy.facts.type}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {isCaseStudySectionVisible(caseStudy, 'heroScreens') ? (
          <div className={styles.sectionBleed}>
            <ProjectBentoGrid
              screens={heroScreens}
              accent={project.accent}
              onInspect={(_index, screen) => openScreenLightbox(screen)}
            />
          </div>
        ) : null}
      </section>

      {isCaseStudySectionVisible(caseStudy, 'overview') ? (
      <section id="section-overview" className={`${styles.section} ${styles.sectionCream}`}>
        <div className={styles.sectionInner}>
          <p className={styles.sectionLabel}>
            {caseStudy.overview.sectionNumber} — Overview
          </p>
          <HighlightTitle
            title={caseStudy.overview.title}
            highlight={caseStudy.overview.highlight}
            className={styles.sectionTitle}
            highlightClassName={styles.highlightBurgundy}
          />

          <div className={styles.twoCol}>
            <div className={styles.colBlock}>
              <p className={styles.colEyebrow}>{caseStudy.overview.problemLabel}</p>
              <h3 className={styles.colTitle}>{caseStudy.overview.problemTitle}</h3>
              <div className={styles.colDivider} />
              <p className={styles.colBody}>{caseStudy.overview.problemText}</p>
            </div>
            <div className={styles.colBlock}>
              <p className={styles.colEyebrow}>{caseStudy.overview.solutionLabel}</p>
              <h3 className={styles.colTitle}>{caseStudy.overview.solutionTitle}</h3>
              <div className={styles.colDivider} />
              <p className={styles.colBody}>{caseStudy.overview.solutionText}</p>
            </div>
          </div>
        </div>
      </section>
      ) : null}

      {isCaseStudySectionVisible(caseStudy, 'myRole') ? (
      <section id="section-role" className={`${styles.section} ${styles.sectionWhite}`}>
        <div className={styles.sectionInner}>
          <p className={styles.sectionLabel}>
            {caseStudy.myRole.sectionNumber} — My role
          </p>
          <HighlightTitle
            title={caseStudy.myRole.title}
            highlight={caseStudy.myRole.highlight}
            className={styles.sectionTitle}
            highlightClassName={styles.highlightBurgundy}
          />
          <p className={styles.roleIntro}>{caseStudy.myRole.intro}</p>
          <ul className={styles.pillList}>
            {caseStudy.myRole.pills.map((pill) => (
              <li key={pill}>{pill}</li>
            ))}
          </ul>
        </div>
      </section>
      ) : null}

      {isCaseStudySectionVisible(caseStudy, 'research') ? (
      <section id="section-research" className={`${styles.section} ${styles.sectionCream}`}>
        <div className={styles.sectionInner}>
          <p className={styles.sectionLabel}>
            {caseStudy.research.sectionNumber} — Research and discovery
          </p>
          <HighlightTitle
            title={caseStudy.research.title}
            highlight={caseStudy.research.highlight}
            className={styles.sectionTitle}
            highlightClassName={styles.highlightBurgundy}
          />

          <div className={styles.insightGrid}>
            {caseStudy.research.insights.map((insight) => (
              <article key={insight.number} className={styles.insightCard}>
                <span className={styles.insightNumber}>{insight.number}</span>
                <h3 className={styles.insightTitle}>{insight.title}</h3>
                <p className={styles.insightBody}>{insight.text}</p>
              </article>
            ))}
          </div>
        </div>

        {(caseStudy.research.personas || []).filter((persona) => (
          persona?.name || persona?.role || persona?.goal || persona?.painPoint
          || persona?.behaviour || persona?.quote
        )).length ? (
          <div className={styles.sectionBleed}>
            <div
              className={styles.personaStrip}
              data-single={
                (caseStudy.research.personas || []).filter((persona) => (
                  persona?.name || persona?.role || persona?.goal || persona?.painPoint
                  || persona?.behaviour || persona?.quote
                )).length === 1 ? 'true' : 'false'
              }
            >
            {(caseStudy.research.personas || []).map((persona, index) => {
                const hasContent = persona?.name || persona?.role || persona?.goal
                  || persona?.painPoint || persona?.behaviour || persona?.quote;
                if (!hasContent) return null;

                return (
                  <article key={`${persona.name || 'persona'}-${index}`} className={styles.personaCard}>
                    <div className={styles.personaAvatar}>
                      <PersonIcon />
                    </div>
                    <div className={styles.personaContent}>
                      <h3 className={styles.personaName}>{persona.name}</h3>
                      <p className={styles.personaRole}>{persona.role}</p>
                      <dl className={styles.personaGrid}>
                        <div>
                          <dt>Goal</dt>
                          <dd>{persona.goal}</dd>
                        </div>
                        <div>
                          <dt>Pain point</dt>
                          <dd>{persona.painPoint}</dd>
                        </div>
                        <div>
                          <dt>Behaviour</dt>
                          <dd>{persona.behaviour}</dd>
                        </div>
                        <div>
                          <dt>Quote</dt>
                          <dd>{persona.quote}</dd>
                        </div>
                      </dl>
                    </div>
                  </article>
                );
            })}
            </div>
          </div>
        ) : null}
      </section>
      ) : null}

      {isCaseStudySectionVisible(caseStudy, 'quote') ? (
      <section id="section-quote" className={`${styles.section} ${styles.sectionBurgundy} ${styles.quoteSection}`}>
        <div className={styles.sectionInner}>
          <blockquote className={styles.quoteBlock}>
            <span className={styles.quoteMark} aria-hidden="true">
              &ldquo;
            </span>
            <p className={styles.quoteText}>{caseStudy.quote.text}</p>
            <cite className={styles.quoteAttribution}>{caseStudy.quote.attribution}</cite>
          </blockquote>
        </div>
      </section>
      ) : null}

      {showWalkthrough ? (
        <section id="section-walkthrough" className={`${styles.section} ${styles.sectionCream}`}>
          <div className={styles.sectionInner}>
            <p className={styles.sectionLabel}>
              {caseStudy.walkthrough?.sectionNumber || '04'} — Walkthrough
            </p>
            <HighlightTitle
              title={caseStudy.walkthrough?.title || 'Project walkthrough.'}
              highlight={caseStudy.walkthrough?.highlight || 'walkthrough'}
              className={styles.sectionTitle}
              highlightClassName={styles.highlightBurgundy}
            />

            <div className={styles.walkthroughFrame}>
              {walkthroughVideo.type === 'iframe' ? (
                <iframe
                  className={styles.walkthroughMedia}
                  src={walkthroughVideo.src}
                  title={walkthroughVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  className={styles.walkthroughMedia}
                  src={walkthroughVideo.src}
                  poster={caseStudy.walkthrough?.posterUrl || undefined}
                  controls
                  playsInline
                  preload="metadata"
                />
              )}
            </div>
            {caseStudy.walkthrough?.caption ? (
              <p className={styles.walkthroughCaption}>{caseStudy.walkthrough.caption}</p>
            ) : null}
          </div>
        </section>
      ) : null}

      {isCaseStudySectionVisible(caseStudy, 'designProcess') ? (
      <section id="section-process" className={`${styles.section} ${styles.sectionWhite}`}>
        <div className={styles.sectionInner}>
          <p className={styles.sectionLabel}>
            {caseStudy.designProcess.sectionNumber} — Design process
          </p>
          <HighlightTitle
            title={caseStudy.designProcess.title}
            highlight={caseStudy.designProcess.highlight}
            className={styles.sectionTitle}
            highlightClassName={styles.highlightBurgundy}
          />

        </div>

        <div className={styles.sectionBleed}>
          <div className="screenGalleryLight">
            <CaseStudyScreenGallery
              screens={caseStudy.designProcess.stages}
              onInspect={(_index, stage) => openScreenLightbox(stage)}
              hint="Scroll sideways · Tap to view full size"
              variant="board"
            />
          </div>
        </div>
      </section>
      ) : null}

      {isCaseStudySectionVisible(caseStudy, 'finalDesign') ? (
      <section id="section-final" className={`${styles.section} ${styles.sectionDark}`}>
        <div className={styles.sectionInner}>
          <p className={`${styles.sectionLabel} ${styles.sectionLabelPink}`}>
            {caseStudy.finalDesign.sectionNumber} — Final design
          </p>
          <HighlightTitle
            title={caseStudy.finalDesign.title}
            highlight={caseStudy.finalDesign.highlight}
            className={`${styles.sectionTitle} ${styles.sectionTitleLight}`}
            highlightClassName={styles.highlightPink}
          />

        </div>

        <div className={styles.sectionBleed}>
          <div className="screenGalleryDark">
            <CaseStudyScreenGallery
              screens={caseStudy.finalDesign.screens}
              onInspect={(_index, screen) => openScreenLightbox(screen)}
              hint="Scroll sideways · Tap to view full size"
              accent="#FFD5FB"
            />
          </div>
        </div>
      </section>
      ) : null}

      {isCaseStudySectionVisible(caseStudy, 'outcomes') ? (
      <section id="section-outcomes" className={`${styles.section} ${styles.sectionBurgundy}`}>
        <div className={styles.sectionInner}>
          <p className={`${styles.sectionLabel} ${styles.sectionLabelPink}`}>
            {caseStudy.outcomes.sectionNumber} — Outcomes and results
          </p>
          <HighlightTitle
            title={caseStudy.outcomes.title}
            highlight={caseStudy.outcomes.highlight}
            className={`${styles.sectionTitle} ${styles.sectionTitleLight}`}
            highlightClassName={styles.highlightPink}
          />

          <div className={styles.metricGrid}>
            {caseStudy.outcomes.metrics.map((metric) => (
              <article key={metric.value} className={styles.metricCard}>
                <p className={styles.metricValue}>{metric.value}</p>
                <p className={styles.metricLabel}>{metric.label}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      ) : null}

      {/* Section 9 — Next project */}
      {next ? (
        <Link
          to={`/work/${next.slug}`}
          className={styles.nextStrip}
          onClick={(event) => goToProject(event, next.slug)}
        >
          <div className={styles.nextStripContent}>
            <p className={styles.nextLabel}>Next project</p>
            <p className={styles.nextTitle}>{next.title} →</p>
          </div>
          <span className={styles.nextArrow} aria-hidden="true">
            →
          </span>
        </Link>
      ) : null}

      <ImageLightbox
        items={lightboxItems}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChangeIndex={setLightboxIndex}
      />
    </div>
  );
}
