import defaultContent from '../data/defaultContent.json';
import { getHomeProjects, HOME_WORK_LIMIT } from '../data/featuredWork';
import { useSiteContent } from '../context/SiteContentContext';
import useScrollAnimations from '../hooks/useScrollAnimations';
import AboutSection from './AboutSection';
import ContactSection from './ContactSection';
import ProcessSection from './ProcessSection';
import WorkSpraySection from './WorkSpraySection';
import styles from './PortfolioSections.module.css';

export default function PortfolioSections() {
  const { content } = useSiteContent();
  const featuredWork = content?.featuredWork || defaultContent.featuredWork;
  const homeLimit = featuredWork?.homeLimit ?? HOME_WORK_LIMIT;
  const homeProjects = getHomeProjects(
    featuredWork?.projects,
    featuredWork?.homeProjectSlugs,
    homeLimit,
  );
  useScrollAnimations(Boolean(homeProjects.length));

  if (!homeProjects.length) return null;

  return (
    <main className={styles.main}>
      <WorkSpraySection
        projects={homeProjects}
        moreWorkLabel={featuredWork?.moreWorkLabel || 'View more'}
      />

      <AboutSection />

      <ProcessSection />

      <ContactSection />
    </main>
  );
}
