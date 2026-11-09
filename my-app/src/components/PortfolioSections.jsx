import defaultContent from '../data/defaultContent.json';
import { getHomeProjects, HOME_WORK_LIMIT } from '../data/featuredWork';
import { useSiteContent } from '../context/SiteContentContext';
import useScrollAnimations from '../hooks/useScrollAnimations';
import AboutSection from './AboutSection';
import ContactSection from './ContactSection';
import VelocityTapes from './fx/VelocityTapes';
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

      <VelocityTapes
        text="LET'S TALK · OPEN FOR WORK · SAY HI · CAIRO → ANYWHERE"
        altText="UX · UI · BRAND · FRONT-END · MOTION"
        from="#FCF4F0"
        to="#6D0101"
        dark
      />

      <ContactSection />
    </main>
  );
}
