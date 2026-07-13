import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useCms } from '../context/ContentContext';
import { getPreviewConfig, PREVIEW_ORIGIN } from '../utils/preview';

export default function PreviewPanel({ open = true, onClose }) {
  const { previewContent, previewStale, refreshPreview, loading } = useCms();
  const location = useLocation();
  const iframeRef = useRef(null);
  const [ready, setReady] = useState(false);
  const { src, scrollTo } = getPreviewConfig(location.pathname);

  const sendPreview = useCallback((payload) => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: 'CMS_PREVIEW_UPDATE',
        ...payload,
      },
      PREVIEW_ORIGIN,
    );
  }, []);

  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== PREVIEW_ORIGIN) return;
      if (event.data?.type === 'CMS_PREVIEW_READY') setReady(true);
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    setReady(false);
  }, [src]);

  useEffect(() => {
    if (!previewContent || !ready || !open) return;
    sendPreview({ content: previewContent });
  }, [previewContent, ready, open, sendPreview]);

  useEffect(() => {
    if (!ready || !open || !scrollTo) return;
    sendPreview({ scrollTo });
  }, [scrollTo, src, ready, open, sendPreview]);

  return (
    <aside className={`preview-panel ${open ? 'is-open' : ''}`}>
      <div className="preview-header">
        <div>
          <strong>Live preview</strong>
          <p className="muted">
            {previewStale
              ? 'Typing… preview updates when you pause or click Update.'
              : 'In sync with your edits. Save to publish.'}
          </p>
        </div>
        <div className="preview-header-actions">
          {!ready && !loading ? <span className="preview-status">Loading…</span> : null}
          <button
            type="button"
            className={`btn btn-secondary btn-sm ${previewStale ? 'preview-update-pending' : ''}`}
            onClick={refreshPreview}
            disabled={!previewStale || !previewContent}
          >
            Update preview
          </button>
          {onClose ? (
            <button type="button" className="btn btn-secondary btn-sm preview-close" onClick={onClose}>
              Edit
            </button>
          ) : null}
        </div>
      </div>
      <iframe
        ref={iframeRef}
        title="Site preview"
        src={src}
        className="preview-frame"
      />
    </aside>
  );
}
