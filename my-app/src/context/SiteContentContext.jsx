import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchSiteContent } from '../api/contentApi';
import { mergeSiteContent } from '../utils/mergeContent';

const SiteContentContext = createContext(null);

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchSiteContent().then((data) => {
      if (active) {
        setContent(mergeSiteContent(data));
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  const value = useMemo(
    () => ({ content, loading }),
    [content, loading],
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
