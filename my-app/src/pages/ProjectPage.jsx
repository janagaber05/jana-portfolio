import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { getCaseStudy, PROGRESS_SECTIONS } from '../data/caseStudies';
import { getAdjacentProjects, getProjectBySlug } from '../data/featuredWork';
import { useSiteContent } from '../context/SiteContentContext';
import { cleanupScrollEffects } from '../utils/scrollCleanup';
import { getResolvedImageSrc, resolveImageSources } from '../utils/resolveImageSources';
import { resolveWalkthroughVideo } from '../utils/walkthroughVideo';
import ProjectBentoGrid, { GripIcon } from '../components/ProjectBentoGrid';
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

function CaseStudyImage({ imageUrl, candidates, fallback, alt, className }) {
  const sources = resolveImageSources(imageUrl, candidates, fallback);
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => {
    setSourceIndex(0);
  }, [imageUrl, candidates, fallback]);

  return (
    <img
      src={sources[sourceIndex]}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        setSourceIndex((current) => (
          current < sources.length - 1 ? current + 1 : current
        ));
      }}
    />
  );
}

function ProcessImageCard({ label, imageUrl, imageCandidates, fallbackImage, alt, onOpen }) {
  return (
    <figure className={styles.processCard}>
      <button
        type="button"
        className={styles.inspectButton}
        onClick={onOpen}
        aria-label={`View full size: ${label}`}
      >
        <CaseStudyImage
          imageUrl={imageUrl}
          candidates={imageCandidates}
          fallback={fallbackImage}
          alt={alt}
          className={styles.processImage}
        />
      </button>
      <figcaption className={styles.processLabel}>{label}</figcaption>
    </figure>
  );
}

function FinalImageCard({ label, imageUrl, imageCandidates, fallbackImage, alt, wide, onOpen }) {
  return (
    <figure className={`${styles.finalCard} ${wide ? styles.finalCardWide : ''}`}>
      <button
        type="button"
        className={styles.inspectButton}
        onClick={onOpen}
        aria-label={`View full size: ${label}`}
      >
        <CaseStudyImage
          imageUrl={imageUrl}
          candidates={imageCandidates}
          fallback={fallbackImage}
          alt={alt}
          className={styles.finalImage}
        />
      </button>
      <figcaption className={styles.finalLabel}>{label}</figcaption>
    </figure>
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

function toLightboxItem(label, imageUrl, candidates, fallback, alt) {
  const src = getResolvedImageSrc(imageUrl, candidates, fallback);
  if (!src) return null;
  return {
    src,
    label,
    alt: alt || label || '',
  };
}

export default function ProjectPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { content, loading } = useSiteContent();
  const projects = content?.featuredWork?.projects || [];
  const project = getProjectBySlug(projects, slug);
  const caseStudy = getCaseStudy(project, content?.caseStudies);
  const { next } = getAdjacentProjects(projects, slug);
  const walkthroughVideo = resolveWalkthroughVideo(caseStudy?.walkthrough?.videoUrl);
  const sectionIds = PROGRESS_SECTIONS
    .filter((section) => section.id !== 'section-walkthrough' || walkthroughVideo)
    .map((section) => section.id);
  const progressSections = PROGRESS_SECTIONS.filter(
    (section) => section.id !== 'section-walkthrough' || walkthroughVideo,
  );
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
    return raw.filter((screen) => Boolean(screen?.imageUrl));
  }, [caseStudy]);

  const lightboxItems = useMemo(() => {
    if (!caseStudy || !project) return [];

    const items = [];

    if (caseStudy.heroImage) {
      items.push({
        src: caseStudy.heroImage,
        label: `${project.title} hero`,
        alt: `${project.title} hero`,
      });
    }

    heroScreens.forEach((screen, index) => {
      const item = toLightboxItem(
        screen.label || `Screen ${index + 1}`,
        screen.imageUrl,
        screen.imageCandidates,
        screen.fallbackImage,
        screen.alt,
      );
      if (item) items.push(item);
    });

    (caseStudy.designProcess?.stages || []).forEach((stage, index) => {
      const item = toLightboxItem(
        stage.label || `Wireframe ${index + 1}`,
        stage.imageUrl,
        stage.imageCandidates,
        stage.fallbackImage,
        stage.alt,
      );
      if (item) items.push(item);
    });

    (caseStudy.finalDesign?.screens || []).forEach((screen, index) => {
      const item = toLightboxItem(
        screen.label || `Final screen ${index + 1}`,
        screen.imageUrl,
        screen.imageCandidates,
        screen.fallbackImage,
        screen.alt,
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

  const openLightboxItem = (label, imageUrl, candidates, fallback, alt) => {
    const item = toLightboxItem(label, imageUrl, candidates, fallback, alt);
    if (!item) return;
    openLightboxBySrc(item.src);
  };

  if (loading) {
    return <div className={styles.page} aria-busy="true" />;
  }

  if (!project || !caseStudy) {
    return <Navigate to="/" replace />;
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
        {caseStudy.heroImage ? (
          <div className={styles.heroBleed}>
            <Link to="/#work" className={`${styles.heroBack} ${styles.heroBackOverlay}`} onClick={goHome}>
              ← Back to work
            </Link>
            <button
              type="button"
              className={styles.inspectButton}
              onClick={() => openLightboxBySrc(caseStudy.heroImage)}
              aria-label={`View full size: ${project.title} hero`}
            >
              <img
                src={caseStudy.heroImage}
                alt={`${project.title} hero`}
                className={styles.heroBleedImage}
              />
            </button>
          </div>
        ) : null}

        <div className={styles.heroBody}>
          <span className={styles.heroWatermark} aria-hidden="true">
            {caseStudy.abbreviation}
          </span>

          {!caseStudy.heroImage ? (
            <Link to="/#work" className={styles.heroBack} onClick={goHome}>
              ← Back to work
            </Link>
          ) : null}

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

            <ProjectBentoGrid
              screens={heroScreens}
              accent={project.accent}
              onInspect={(_index, screen) => openLightboxItem(
                screen.label,
                screen.imageUrl,
                screen.imageCandidates,
                screen.fallbackImage,
                screen.alt,
              )}
            />
          </div>
        </div>
      </section>

      {/* Section 2 — Overview */}
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

      {/* Section 3 — My role */}
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

      {/* Section 4 — Research */}
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

          <article className={styles.personaCard}>
            <div className={styles.personaAvatar}>
              <PersonIcon />
            </div>
            <div className={styles.personaContent}>
              <h3 className={styles.personaName}>{caseStudy.research.persona.name}</h3>
              <p className={styles.personaRole}>{caseStudy.research.persona.role}</p>
              <dl className={styles.personaGrid}>
                <div>
                  <dt>Goal</dt>
                  <dd>{caseStudy.research.persona.goal}</dd>
                </div>
                <div>
                  <dt>Pain point</dt>
                  <dd>{caseStudy.research.persona.painPoint}</dd>
                </div>
                <div>
                  <dt>Behaviour</dt>
                  <dd>{caseStudy.research.persona.behaviour}</dd>
                </div>
                <div>
                  <dt>Quote</dt>
                  <dd>{caseStudy.research.persona.quote}</dd>
                </div>
              </dl>
            </div>
          </article>
        </div>
      </section>

      {/* Section 5 — Quote */}
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

      {/* Section — Walkthrough video */}
      {walkthroughVideo ? (
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

      {/* Section 6 — Design process */}
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

          <div className={styles.processGrid}>
            {caseStudy.designProcess.stages.map((stage) => (
              <ProcessImageCard
                key={stage.label}
                label={stage.label}
                imageUrl={stage.imageUrl}
                imageCandidates={stage.imageCandidates}
                fallbackImage={stage.fallbackImage}
                alt={stage.alt}
                onOpen={() => openLightboxItem(
                  stage.label,
                  stage.imageUrl,
                  stage.imageCandidates,
                  stage.fallbackImage,
                  stage.alt,
                )}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Section 7 — Final design */}
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

          <div className={styles.finalGrid}>
            {caseStudy.finalDesign.screens.map((screen, index) => (
              <FinalImageCard
                key={screen.label}
                label={screen.label}
                imageUrl={screen.imageUrl}
                imageCandidates={screen.imageCandidates}
                fallbackImage={screen.fallbackImage}
                alt={screen.alt}
                wide={index === 0}
                onOpen={() => openLightboxItem(
                  screen.label,
                  screen.imageUrl,
                  screen.imageCandidates,
                  screen.fallbackImage,
                  screen.alt,
                )}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Section 8 — Outcomes */}
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
