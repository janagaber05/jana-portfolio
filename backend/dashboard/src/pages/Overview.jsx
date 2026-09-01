import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import HistoryPanel from '../components/HistoryPanel';
import { useCms } from '../context/ContentContext';
import { exportContentJson, findBrokenLinks } from '../utils/cmsTools';
import { PORTFOLIO_ORIGIN } from '../utils/preview';

function formatCount(value) {
  if (value === null || value === undefined) return '—';
  return Number(value).toLocaleString();
}

const VISITOR_STATS = [
  { key: 'live', label: 'Live now', live: true },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'last_7_days', label: 'Last 7 days' },
  { key: 'last_30_days', label: 'Last 30 days' },
  { key: 'last_6_months', label: 'Last 6 months' },
  { key: 'last_year', label: 'Last year' },
];

const ACTION_LABELS = {
  draft_saved: 'Saved draft',
  published: 'Published live',
  revision_restored: 'Restored version',
};

export default function Overview() {
  const { content, draft, published, hasUnpublishedChanges, discardDraft, publish, publishing } = useCms();
  const [analytics, setAnalytics] = useState(null);
  const [analyticsError, setAnalyticsError] = useState('');
  const [activity, setActivity] = useState([]);
  const [brokenLinks, setBrokenLinks] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let active = true;

    const loadAnalytics = async () => {
      try {
        const data = await api.getAnalytics();
        if (!active) return;
        setAnalytics(data);
        setAnalyticsError('');
      } catch (error) {
        if (!active) return;
        setAnalyticsError(error.message);
      }
    };

    loadAnalytics();
    const intervalId = window.setInterval(loadAnalytics, 30000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    api.getActivity().then(setActivity).catch(() => {});
    api.getContactSubmissions()
      .then((items) => setUnreadCount(items.filter((item) => !item.read_at).length))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!draft) return;
    setBrokenLinks(findBrokenLinks(draft));
  }, [draft]);

  if (!content) return null;

  const projectCount = content.featuredWork?.projects?.length || 0;
  const homeCount = content.featuredWork?.homeProjectSlugs?.length || 0;
  const caseStudyCount = Object.keys(content.caseStudies || {}).length;
  const scheduledCount = (draft?.featuredWork?.projects || []).filter((project) => {
    if (project.published === false) return false;
    return project.publishAt && new Date(project.publishAt).getTime() > Date.now();
  }).length;

  const handlePublish = async () => {
    if (!draft) return;
    await publish(draft);
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Overview</h1>
        <p>
          Draft changes stay private until you publish.
          {hasUnpublishedChanges ? ' You have unpublished edits.' : ' Live site matches your draft.'}
        </p>
        <div className="overview-actions">
          {hasUnpublishedChanges ? (
            <button type="button" className="btn btn-secondary" onClick={discardDraft}>
              Discard draft
            </button>
          ) : null}
          <button
            type="button"
            className="btn btn-primary"
            onClick={handlePublish}
            disabled={publishing || !hasUnpublishedChanges}
          >
            {publishing ? 'Publishing…' : 'Publish live'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => exportContentJson(draft || published, 'jana-portfolio-backup.json')}
          >
            Export backup
          </button>
          <Link to="/inbox" className="btn btn-secondary">
            Inbox{unreadCount > 0 ? ` (${unreadCount})` : ''}
          </Link>
        </div>
      </header>

      <section className="card analytics-card">
        <div className="analytics-card-header">
          <div>
            <h3 className="card-title">Visitors</h3>
            <p className="muted">Unique visitors. Live count refreshes every 30 seconds.</p>
          </div>
        </div>

        {analyticsError ? (
          <p className="status error analytics-error">
            {analyticsError.includes('get_site_analytics')
              ? 'Analytics not set up. Run backend/supabase/08_analytics.sql in Supabase.'
              : analyticsError}
          </p>
        ) : null}

        <div className="stat-grid stat-grid--analytics">
          {VISITOR_STATS.map((stat) => (
            <div
              key={stat.key}
              className={`stat-card${stat.live ? ' stat-card--live' : ''}`}
            >
              <span className="stat-value">{formatCount(analytics?.[stat.key])}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>

        {analytics?.top_pages?.length ? (
          <div className="top-pages">
            <h4>Top pages (30 days)</h4>
            <ul className="top-pages-list">
              {analytics.top_pages.map((row) => (
                <li key={row.path}>
                  <span>{row.path}</span>
                  <strong>{row.views}</strong>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

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
        <div className="stat-card">
          <span className="stat-value">{scheduledCount}</span>
          <span className="stat-label">Scheduled</span>
        </div>
      </div>

      <section className="card">
        <h3 className="card-title">Activity log</h3>
        {activity.length === 0 ? (
          <p className="muted">No activity yet.</p>
        ) : (
          <ul className="activity-list">
            {activity.map((item) => (
              <li key={item.id}>
                <strong>{ACTION_LABELS[item.action] || item.action}</strong>
                {item.detail ? <span> — {item.detail}</span> : null}
                <time>{new Date(item.created_at).toLocaleString()}</time>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h3 className="card-title">Link checker</h3>
        <p className="muted">External URLs in your draft content.</p>
        {brokenLinks.length === 0 ? (
          <p className="muted">No external links found in content.</p>
        ) : (
          <ul className="link-check-list">
            {brokenLinks.slice(0, 12).map((link) => (
              <li key={`${link.path}-${link.url}`}>
                <code>{link.path}</code>
                <a href={link.url} target="_blank" rel="noreferrer">{link.url}</a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <HistoryPanel />

      <div className="quick-links">
        <Link to="/settings" className="quick-link">Site settings →</Link>
        <Link to="/hero" className="quick-link">Edit Hero &amp; menu →</Link>
        <Link to="/work" className="quick-link">Edit Projects →</Link>
        <Link to="/contact" className="quick-link">Edit Contact →</Link>
      </div>

      <section className="card">
        <h3 className="card-title">Live site</h3>
        <p className="muted">
          Portfolio:{' '}
          <a href={PORTFOLIO_ORIGIN} target="_blank" rel="noreferrer">{PORTFOLIO_ORIGIN}</a>
        </p>
        <p className="muted">
          More work page:{' '}
          <a href={`${PORTFOLIO_ORIGIN}/work`} target="_blank" rel="noreferrer">{PORTFOLIO_ORIGIN}/work</a>
        </p>
      </section>
    </div>
  );
}
