import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchSiteContent } from '../api/contentApi';
import defaultContent from '../data/defaultContent.json';
import { mergeSiteContent } from '../utils/mergeContent';

const SiteContentContext = createContext(null);

export function SiteContentProvider({ children, preview = false }) {
  const [content, setContent] = useState(preview ? mergeSiteContent(defaultContent) : null);
  const [loading, setLoading] = useState(!preview);

  useEffect(() => {
    if (!preview) {
      let active = true;
      fetchSiteContent().then((data) => {
        if (active) {
          setContent(mergeSiteContent(data));
          setLoading(false);
        }
      });
      return () => { active = false; };
    }

    const onMessage = (event) => {
      if (event.data?.type !== 'CMS_PREVIEW_UPDATE') return;

      if (event.data.content) {
        setContent(mergeSiteContent(event.data.content));
        setLoading(false);
      }

      const scrollId = event.data.scrollTo;
      if (!scrollId) return;

      requestAnimationFrame(() => {
        const target = document.getElementById(scrollId);
        target?.scrollIntoView({ behavior: 'auto', block: 'start' });
      });
    };

    window.addEventListener('message', onMessage);
    window.parent.postMessage({ type: 'CMS_PREVIEW_READY' }, '*');

    return () => window.removeEventListener('message', onMessage);
  }, [preview]);

  const value = useMemo(
    () => ({ content, loading, preview }),
    [content, loading, preview],
  );

  return (
    <SiteContentContext.Provider value={value}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error('useSiteContent must be used within SiteContentProvider');
  return ctx;
}
