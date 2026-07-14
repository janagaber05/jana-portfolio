import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useCms } from '../context/ContentContext';
import { api } from '../api';

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

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

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

  return (
    <div className="layout">
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
    </div>
  );
}
