import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useCms } from '../context/ContentContext';
import { cloneContent } from '../utils/cloneContent';

export function useContentDraft() {
  const { content, saveAll, saving } = useCms();
  const location = useLocation();
  const [draft, setDraft] = useState(() => cloneContent(content));

  useEffect(() => {
    setDraft(cloneContent(content));
  }, [location.pathname]);

  useEffect(() => {
    if (content) {
      setDraft(cloneContent(content));
    }
  }, [content]);

  const updateDraft = useCallback((updater) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return typeof updater === 'function' ? updater(prev) : updater;
    });
  }, []);

  const save = useCallback(async () => {
    if (!draft) return;
    await saveAll(draft);
  }, [draft, saveAll]);

  return {
    draft,
    setDraft,
    updateDraft,
    save,
    saving,
    ready: Boolean(draft),
  };
}
