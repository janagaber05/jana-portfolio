import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchSiteContent } from '../api/contentApi';
import defaultContent from '../data/defaultContent.json';
import { mergeSiteContent } from '../utils/mergeContent';
import { applyPublishFilters } from '../utils/publishFilters';
import { readPreviewDraft } from '../utils/previewContent';

const SiteContentContext = createContext(null);

function buildContentState(data) {
  const merged = mergeSiteContent(data);
  return {
    mergedContent: merged,
    content: applyPublishFilters(merged),
  };
}

export function SiteContentProvider({ children }) {
  const [mergedContent, setMergedContent] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    let active = true;

    const finish = (data, preview = false) => {
      if (!active) return;
      const next = buildContentState(data);
      setMergedContent(next.mergedContent);
      setContent(next.content);
      setIsPreview(preview);
      setLoading(false);
    };

    const previewDraft = readPreviewDraft();
    if (previewDraft) {
      finish(previewDraft, true);
      return () => { active = false; };
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('preview') === '1') {
      params.delete('preview');
      const next = `${window.location.pathname}${params.toString() ? `?${params}` : ''}${window.location.hash}`;
      window.history.replaceState({}, '', next);
    }

    fetchSiteContent()
      .then((data) => finish(data))
      .catch((error) => {
        console.warn('[Portfolio] Could not load site content:', error.message);
        finish(defaultContent);
      });

    return () => { active = false; };
  }, []);

  const fallback = useMemo(() => buildContentState(defaultContent), []);

  const value = useMemo(
    () => ({
      content: content || fallback.content,
      mergedContent: mergedContent || fallback.mergedContent,
      loading,
      isPreview,
    }),
    [content, mergedContent, fallback, loading, isPreview],
  );

  return (
    <SiteContentContext.Provider value={value}>
      {loading ? (
        <div
          style={{ minHeight: '100vh', background: '#FCF4F0' }}
          aria-busy="true"
          aria-label="Loading portfolio"
        />
      ) : (
        children
      )}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error('useSiteContent must be used within SiteContentProvider');
  return ctx;
}
