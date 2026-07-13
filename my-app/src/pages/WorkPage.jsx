import { Link, useNavigate } from 'react-router-dom';
import { useSiteContent } from '../context/SiteContentContext';
import { cleanupScrollEffects } from '../utils/scrollCleanup';
import styles from './WorkPage.module.css';

function ProjectCard({ project }) {
  const navigate = useNavigate();

  const handleClick = (event) => {
    event.preventDefault();
    cleanupScrollEffects();
    navigate(`/work/${project.slug}`);
  };

  return (
    <Link
      to={`/work/${project.slug}`}
      className={styles.projectLink}
      onClick={handleClick}
    >
      <article className={styles.projectCard} style={{ '--work-accent': project.accent }}>
        <div className={styles.projectThumb} aria-hidden="true">
          <span className={styles.projectIndex}>{project.index}</span>
        </div>
        <div className={styles.projectBody}>
          <h2>{project.title}</h2>
          <p>{project.tag}</p>
          <span className={styles.projectYear}>{project.year}</span>
        </div>
      </article>
    </Link>
  );
}

export default function WorkPage() {
  const { content, loading } = useSiteContent();
  const featuredWork = content?.featuredWork;
  const projects = featuredWork?.projects || [];

  if (loading) return null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.backLink} onClick={cleanupScrollEffects}>
          ← Back home
        </Link>
        <p className={styles.eyebrow}>{featuredWork?.eyebrow || 'Work'}</p>
        <h1>{featuredWork?.moreWorkPageTitle || 'More work'}</h1>
        <p className={styles.intro}>
          {featuredWork?.moreWorkPageIntro || 'Every project — from product design to brand and development.'}
        </p>
      </header>

      <div className={styles.grid}>
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
