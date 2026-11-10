import { useEffect, useState } from 'react';
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
import SettingsEditor from './pages/SettingsEditor';
import InboxEditor from './pages/InboxEditor';
import MediaLibrary from './pages/MediaLibrary';
import { api, getSession } from './api';
import { supabase } from './lib/supabase';

const SESSION_TIMEOUT_MS = 12000;

function isPlaceholderEnv(value) {
  if (!value) return true;
  return /your-project|your_publishable|your_anon|change-this/i.test(value);
}

function getConfigError() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const missing = [];

  if (isPlaceholderEnv(url)) missing.push('VITE_SUPABASE_URL');
  if (isPlaceholderEnv(key)) missing.push('VITE_SUPABASE_ANON_KEY');

  if (missing.length === 0) return '';

  return 'Missing Supabase settings for the CMS. Add them in backend/dashboard/.env, then restart.';
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

function NotAuthorized({ onSignOut }) {
  return (
    <div className="login-page">
      <div className="login-card">
        <p className="eyebrow">Jana CMS</p>
        <h1>Not authorized</h1>
        <p className="muted">This account does not have admin access.</p>
        <button type="button" className="btn btn-primary" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </div>
  );
}

async function sessionIsAdmin(session) {
  if (!session?.access_token) return false;
  const { data, error } = await supabase.rpc('is_admin');
  if (error) return false;
  return data === true;
}

function RequireAuth({ children }) {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [denied, setDenied] = useState(false);
  const configError = getConfigError();

  useEffect(() => {
    if (configError) {
      setChecking(false);
      return undefined;
    }

    let active = true;
    let settled = false;

    const settle = async (session) => {
      if (!active || settled) return;
      settled = true;
      window.clearTimeout(timeoutId);

      if (!session) {
        setAuthed(false);
        setDenied(false);
        setChecking(false);
        return;
      }

      const ok = await sessionIsAdmin(session);
      if (!active) return;

      if (!ok) {
        await api.logout().catch(() => {});
        setAuthed(false);
        setDenied(true);
        setChecking(false);
        return;
      }

      setDenied(false);
      setAuthed(true);
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
      if (event === 'INITIAL_SESSION') return;

      if (event === 'SIGNED_OUT') {
        setAuthed(false);
        setChecking(false);
        return;
      }

      if (session) {
        settled = false;
        settle(session);
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

  if (denied) {
    return (
      <NotAuthorized
        onSignOut={async () => {
          await api.logout().catch(() => {});
          setDenied(false);
          window.location.assign(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/login`);
        }}
      />
    );
  }

  if (!authed) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const adminBase = import.meta.env.BASE_URL.replace(/\/$/, '');
  const configError = getConfigError();

  return (
    <BrowserRouter basename={adminBase || undefined}>
      <Routes>
        <Route
          path="/login"
          element={configError ? <ConfigError message={configError} /> : <Login />}
        />
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
          <Route path="inbox" element={<InboxEditor />} />
          <Route path="settings" element={<SettingsEditor />} />
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
