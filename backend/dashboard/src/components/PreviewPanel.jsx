import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useCms } from '../context/ContentContext';
import { getPreviewConfig, PREVIEW_ORIGIN } from '../utils/preview';

export default function PreviewPanel({ open = true, onClose }) {
  const { content, loading } = useCms();
  const location = useLocation();
  const iframeRef = useRef(null);
  const [ready, setReady] = useState(false);
  const debounceRef = useRef(null);
  const { src, scrollTo } = getPreviewConfig(location.pathname);

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
    if (!content || !iframeRef.current || !open) return undefined;

    const sendPreview = () => {
      iframeRef.current?.contentWindow?.postMessage(
        {
          type: 'CMS_PREVIEW_UPDATE',
          content,
          scrollTo,
        },
        PREVIEW_ORIGIN,
      );
    };

    if (!ready) return undefined;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(sendPreview, 200);

    return () => clearTimeout(debounceRef.current);
  }, [content, ready, scrollTo, src, open]);

  return (
    <aside className={`preview-panel ${open ? 'is-open' : ''}`}>
      <div className="preview-header">
        <div>
          <strong>Live preview</strong>
          <p className="muted">Updates as you type. Save to publish.</p>
        </div>
        <div className="preview-header-actions">
          {!ready && !loading ? <span className="preview-status">Loading…</span> : null}
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
