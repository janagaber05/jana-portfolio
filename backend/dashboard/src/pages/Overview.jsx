import { Link } from 'react-router-dom';
import { useCms } from '../context/ContentContext';

export default function Overview() {
  const { content } = useCms();
  if (!content) return null;

  const projectCount = content.featuredWork?.projects?.length || 0;
  const homeCount = content.featuredWork?.homeProjectSlugs?.length || 0;
  const caseStudyCount = Object.keys(content.caseStudies || {}).length;

  return (
    <div className="page">
      <header className="page-header">
        <h1>Overview</h1>
        <p>Edits save to Supabase and appear on the live site after you click Save changes.</p>
      </header>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-value">{homeCount}</span>
          <span className="stat-label">On home scroll</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{projectCount}</span>
          <span className="stat-label">Total projects</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{caseStudyCount}</span>
          <span className="stat-label">Case studies</span>
        </div>
      </div>

      <div className="quick-links">
        <Link to="/hero" className="quick-link">Edit Hero &amp; menu →</Link>
        <Link to="/work" className="quick-link">Edit Projects →</Link>
        <Link to="/contact" className="quick-link">Edit Contact →</Link>
      </div>

      <section className="card">
        <h3 className="card-title">Live site</h3>
        <p className="muted">Portfolio: <a href="http://localhost:3000" target="_blank" rel="noreferrer">http://localhost:3000</a></p>
        <p className="muted">More work page: <a href="http://localhost:3000/work" target="_blank" rel="noreferrer">http://localhost:3000/work</a></p>
        <p className="muted">Keep <code>npm start</code> running in <code>my-app</code> while editing so preview works.</p>
      </section>
    </div>
  );
}
