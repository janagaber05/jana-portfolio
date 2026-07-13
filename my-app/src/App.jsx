import { BrowserRouter, Route, Routes } from 'react-router-dom';
import RouteChangeHandler from './components/RouteChangeHandler';
import { SiteContentProvider } from './context/SiteContentContext';
import HomePage from './pages/HomePage';
import PreviewLayout from './pages/PreviewLayout';
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

function MainSite() {
  return (
    <SiteContentProvider>
      <RouteChangeHandler>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/work" element={<WorkPage />} />
          <Route path="/work/:slug" element={<ProjectPage />} />
        </Routes>
      </RouteChangeHandler>
    </SiteContentProvider>
  );
}

export default function App() {
  return (
    <>
      <style>{globalStyles}</style>
      <BrowserRouter>
        <Routes>
          <Route
            path="/preview"
            element={(
              <SiteContentProvider preview>
                <PreviewLayout />
              </SiteContentProvider>
            )}
          >
            <Route index element={<HomePage />} />
            <Route path="work" element={<WorkPage />} />
            <Route path="work/:slug" element={<ProjectPage />} />
          </Route>
          <Route path="/*" element={<MainSite />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
