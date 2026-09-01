import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useCms } from '../context/ContentContext';
import { PORTFOLIO_ORIGIN } from '../utils/preview';
import { PREVIEW_KEY } from '../utils/previewDraft';

export default function PreviewPanel() {
  const { draft } = useCms();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const previewPath = useMemo(() => {
    if (location.pathname.includes('/work/project/')) {
      const slug = location.pathname.split('/').pop();
      return `/work/${slug}`;
    }
    if (location.pathname.includes('/work/case-study/')) {
      const slug = location.pathname.split('/').pop();
      return `/work/${slug}`;
    }
    if (location.pathname.startsWith('/work')) return '/work';
    return '/';
  }, [location.pathname]);

  useEffect(() => {
    if (!open || !draft) return;
    try {
      sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(draft));
    } catch {
      // ignore
    }
  }, [open, draft]);

  const iframeSrc = `${PORTFOLIO_ORIGIN}${previewPath}?preview=1&t=${Date.now()}`;

  return (
    <>
      <button
        type="button"
        className="preview-fab"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? 'Hide preview' : 'Live preview'}
      </button>

      {open ? (
        <aside className="preview-panel" aria-label="Live preview">
          <div className="preview-panel-header">
            <strong>Live preview</strong>
            <span className="muted">{previewPath}</span>
            <a href={iframeSrc} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
              Open tab
            </a>
          </div>
          <iframe title="Portfolio preview" src={iframeSrc} className="preview-panel-frame" />
        </aside>
      ) : null}
    </>
  );
}
