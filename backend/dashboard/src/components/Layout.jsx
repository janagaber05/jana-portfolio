import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useCms } from '../context/ContentContext';
import { api } from '../api';
import PreviewPanel from './PreviewPanel';

const NAV = [
  { to: '/', label: 'Overview', end: true },
  { to: '/hero', label: 'Hero' },
  { to: '/work', label: 'Projects' },
  { to: '/about', label: 'About' },
  { to: '/disciplines', label: 'Disciplines' },
  { to: '/process', label: 'Process' },
  { to: '/contact', label: 'Contact' },
  { to: '/media', label: 'Media' },
];

export default function Layout() {
  const { error, loading, load } = useCms();
  const navigate = useNavigate();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1100px)');

    const syncPreview = () => {
      setPreviewOpen(media.matches);
    };

    if (!loading) {
      syncPreview();
    }

    media.addEventListener('change', syncPreview);
    return () => media.removeEventListener('change', syncPreview);
  }, [loading]);

  useEffect(() => {
    document.body.style.overflow = navOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [navOpen]);

  const logout = async () => {
    await api.logout();
    navigate('/login');
  };

  const workspaceClass = previewOpen ? 'workspace preview-open' : 'workspace';

  return (
    <div className="layout layout-with-preview">
      <header className="mobile-topbar">
        <button
          type="button"
          className="icon-btn"
          aria-label="Open menu"
          onClick={() => setNavOpen(true)}
        >
          <span className="icon-btn-lines" aria-hidden="true" />
        </button>
        <div className="mobile-topbar-title">
          <strong>Jana CMS</strong>
          <span className="muted">Portfolio control</span>
        </div>
        <button
          type="button"
          className={`btn btn-secondary btn-sm ${previewOpen ? 'is-active' : ''}`}
          onClick={() => setPreviewOpen((open) => !open)}
        >
          Preview
        </button>
      </header>

      <button
        type="button"
        className={`sidebar-backdrop ${navOpen ? 'is-open' : ''}`}
        aria-label="Close menu"
        onClick={() => setNavOpen(false)}
      />

      <aside className={`sidebar ${navOpen ? 'is-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-mark">JG</span>
          <div>
            <strong>Jana CMS</strong>
            <p>Portfolio control</p>
          </div>
          <button
            type="button"
            className="icon-btn icon-btn--light sidebar-close"
            aria-label="Close menu"
            onClick={() => setNavOpen(false)}
          >
            ×
          </button>
        </div>
        <nav className="sidebar-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className="nav-link"
              onClick={() => setNavOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="btn btn-ghost logout-btn" onClick={logout}>
          Log out
        </button>
      </aside>

      <div className={workspaceClass}>
        <main className="main">
          {loading ? <p className="status">Loading content…</p> : null}
          {error ? (
            <div className="status error">
              <p>{error}</p>
              <button type="button" className="btn btn-secondary btn-sm" onClick={load}>
                Retry load
              </button>
            </div>
          ) : null}
          {!loading ? <Outlet /> : null}
        </main>
        <PreviewPanel open={previewOpen && !loading} onClose={() => setPreviewOpen(false)} />
      </div>
    </div>
  );
}
