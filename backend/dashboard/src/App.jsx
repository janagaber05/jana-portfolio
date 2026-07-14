import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ContentProvider } from './context/ContentContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Overview from './pages/Overview';
import HeroEditor from './pages/HeroEditor';
import WorkEditor from './pages/WorkEditor';
import ProjectEditor from './pages/ProjectEditor';
import CaseStudyEditor from './pages/CaseStudyEditor';
import AboutEditor from './pages/AboutEditor';
import DisciplinesEditor from './pages/DisciplinesEditor';
import ProcessEditor from './pages/ProcessEditor';
import ContactEditor from './pages/ContactEditor';
import MediaLibrary from './pages/MediaLibrary';
import { getSession } from './api';
import { supabase } from './lib/supabase';

const SESSION_TIMEOUT_MS = 12000;

function getConfigError() {
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return 'Missing Supabase settings. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel, then redeploy.';
  }
  return '';
}

function ConfigError({ message }) {
  return (
    <div className="login-page">
      <div className="login-card">
        <p className="eyebrow">Jana CMS</p>
        <h1>Configuration needed</h1>
        <p className="status error">{message}</p>
      </div>
    </div>
  );
}

function RequireAuth({ children }) {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const configError = getConfigError();

  useEffect(() => {
    if (configError) {
      setChecking(false);
      return undefined;
    }

    let active = true;
    let settled = false;

    const settle = (session) => {
      if (!active || settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      setAuthed(!!session);
      setChecking(false);
    };

    const timeoutId = window.setTimeout(() => {
      if (!active || settled) return;
      settle(null);
    }, SESSION_TIMEOUT_MS);

    getSession()
      .then((session) => settle(session))
      .catch(() => settle(null));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      // Initial load is handled by getSession above.
      if (event === 'INITIAL_SESSION') return;

      if (event === 'SIGNED_OUT') {
        setAuthed(false);
        setChecking(false);
        return;
      }

      if (session) {
        setAuthed(true);
        setChecking(false);
      }
    });

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [configError]);

  if (configError) return <ConfigError message={configError} />;
  if (checking) {
    return (
      <div className="login-page">
        <p className="muted">Checking session…</p>
      </div>
    );
  }

  if (!authed) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const adminBase = import.meta.env.BASE_URL.replace(/\/$/, '');

  return (
    <BrowserRouter basename={adminBase || undefined}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={(
            <RequireAuth>
              <ContentProvider>
                <Layout />
              </ContentProvider>
            </RequireAuth>
          )}
        >
          <Route index element={<Overview />} />
          <Route path="hero" element={<HeroEditor />} />
          <Route path="work" element={<WorkEditor />} />
          <Route path="work/project/:slug" element={<ProjectEditor />} />
          <Route path="work/case-study/:slug" element={<CaseStudyEditor />} />
          <Route path="case-studies" element={<Navigate to="/work" replace />} />
          <Route path="more-work" element={<Navigate to="/work" replace />} />
          <Route path="about" element={<AboutEditor />} />
          <Route path="disciplines" element={<DisciplinesEditor />} />
          <Route path="process" element={<ProcessEditor />} />
          <Route path="contact" element={<ContactEditor />} />
          <Route path="media" element={<MediaLibrary />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
