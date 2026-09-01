import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AnalyticsTracker from './components/AnalyticsTracker';
import RouteChangeHandler from './components/RouteChangeHandler';
import SeoHead from './components/SeoHead';
import { useSiteContent } from './context/SiteContentContext';
import { SiteContentProvider } from './context/SiteContentContext';
import HomePage from './pages/HomePage';
import ProjectPage from './pages/ProjectPage';
import WorkPage from './pages/WorkPage';

const globalStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', -apple-system, sans-serif;
    background: #FCF4F0;
    color: #1A1A1A;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }
`;

function PreviewBanner() {
  const { isPreview } = useSiteContent();
  if (!isPreview) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      background: '#6D0101',
      color: '#FCF4F0',
      textAlign: 'center',
      padding: '0.45rem',
      fontSize: '0.8rem',
      fontFamily: 'Inter, sans-serif',
    }}
    >
      Preview mode — draft changes (not live)
    </div>
  );
}

export default function App() {
  return (
    <>
      <style>{globalStyles}</style>
      <BrowserRouter>
        <SiteContentProvider>
          <PreviewBanner />
          <AnalyticsTracker />
          <SeoHead />
          <RouteChangeHandler>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/work" element={<WorkPage />} />
              <Route path="/work/:slug" element={<ProjectPage />} />
            </Routes>
          </RouteChangeHandler>
        </SiteContentProvider>
      </BrowserRouter>
    </>
  );
}
