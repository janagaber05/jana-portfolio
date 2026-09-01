import { Link, useNavigate } from 'react-router-dom';
import useScrollAnimations from '../hooks/useScrollAnimations';
import { getHomeCountLabel, getHomeProjects, HOME_WORK_LIMIT } from '../data/featuredWork';
import defaultContent from '../data/defaultContent.json';
import { useSiteContent } from '../context/SiteContentContext';
import { cleanupScrollEffects } from '../utils/scrollCleanup';
import AboutSection from './AboutSection';
import ContactSection from './ContactSection';
import ProcessSection from './ProcessSection';
import ProjectThumbnail from './ProjectThumbnail';
import styles from './PortfolioSections.module.css';

function WorkCardLink({ work, cardCta, children }) {
  const navigate = useNavigate();

  const handleClick = (event) => {
    event.preventDefault();
    cleanupScrollEffects();
    navigate(`/work/${work.slug}`);
  };

  return (
    <Link
      to={`/work/${work.slug}`}
      className={styles.workCardLink}
      aria-label={`View ${work.title}`}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}

function MoreWorkLink({ label, arrow }) {
  const navigate = useNavigate();

  const handleClick = (event) => {
    event.preventDefault();
    cleanupScrollEffects();
    navigate('/work');
  };

  return (
    <Link
      to="/work"
      className={styles.moreWorkLink}
      aria-label={label}
      onClick={handleClick}
    >
      <article className={styles.moreWorkCard}>
        <div className={styles.moreWorkInner}>
          <span className={styles.moreWorkText}>{label}</span>
          <span className={styles.moreWorkArrow} aria-hidden="true">{arrow}</span>
        </div>
      </article>
    </Link>
  );
}

export default function PortfolioSections() {
  const { content } = useSiteContent();
  const featuredWork = content?.featuredWork || defaultContent.featuredWork;
  const homeLimit = featuredWork?.homeLimit ?? HOME_WORK_LIMIT;
  const homeProjects = getHomeProjects(featuredWork?.projects, featuredWork?.homeProjectSlugs, homeLimit);
  const homeCountLabel = featuredWork?.countLabel || getHomeCountLabel(featuredWork?.projects, featuredWork?.homeProjectSlugs, homeLimit);

  useScrollAnimations(Boolean(featuredWork?.projects?.length));

  if (!featuredWork?.projects?.length) return null;

  return (
    <main className={styles.main}>
      <section id="work" className={styles.photoStrip}>
        <div className={styles.photoStripHeader}>
          <p className={`${styles.eyebrow} ${styles.photoStripEyebrow}`}>{featuredWork.eyebrow}</p>
          <p className={styles.photoStripCount}>{homeCountLabel}</p>
        </div>
        <div className="inner">
          {homeProjects.map((work, index) => (
            <WorkCardLink key={work.id} work={work} cardCta={featuredWork.cardCta}>
              <article
                className={styles.workCard}
                style={{ '--work-accent': work.accent }}
              >
                <ProjectThumbnail
                  project={work}
                  index={index}
                  className={styles.workCardThumb}
                  imageClassName={styles.workCardImage}
                  fallbackClassName={styles.workCardIndex}
                  alt={`${work.title} project preview`}
                />
                <div className={styles.workCardBody}>
                  <h3>{work.title}</h3>
                  <p>{work.tag}</p>
                </div>
              </article>
            </WorkCardLink>
          ))}
          <MoreWorkLink
            label={featuredWork.moreWorkLabel || 'More work'}
            arrow={featuredWork.moreWorkArrow || '→'}
          />
        </div>
      </section>

      <AboutSection />

      <ProcessSection />

      <ContactSection />
    </main>
  );
}
