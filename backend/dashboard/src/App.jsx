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
import MediaLibrary from './pages/MediaLibrary';
import { getSession } from './api';
import { supabase } from './lib/supabase';

function RequireAuth({ children }) {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    getSession().then((session) => {
      setAuthed(!!session);
      setChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
      setChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
  return (
    <BrowserRouter basename="/admin">
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
