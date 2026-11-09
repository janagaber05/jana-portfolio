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
  const contact = content?.contact || defaultContent.contact;
  const homeLimit = featuredWork?.homeLimit ?? HOME_WORK_LIMIT;
  const homeProjects = getHomeProjects(
    featuredWork?.projects,
    featuredWork?.homeProjectSlugs,
    homeLimit,
  );
  const contactStripTop = contact?.stripTop
    || "LET'S TALK · OPEN FOR WORK · SAY HI · CAIRO → ANYWHERE";
  const contactStripBottom = contact?.stripBottom
    || 'UX · UI · BRAND · FRONT-END · MOTION';
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
        text={contactStripTop}
        altText={contactStripBottom}
        from="#FCF4F0"
        to="#6D0101"
        dark
      />

      <ContactSection />
    </main>
  );
}
