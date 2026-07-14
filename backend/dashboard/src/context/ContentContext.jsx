import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { api } from '../api';
import defaultContent from '../data/defaultContent.json';
import { mergeSiteContent } from '../utils/mergeContent';
import { cloneContent } from '../utils/cloneContent';

const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  const [content, setContent] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const draftRef = useRef(null);

  const applyLoaded = useCallback((merged) => {
    const nextDraft = cloneContent(merged);
    draftRef.current = nextDraft;
    setContent(merged);
    setDraft(nextDraft);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getContent();
      applyLoaded(mergeSiteContent(data));
    } catch (err) {
      applyLoaded(mergeSiteContent(defaultContent));
      setError(err.message || 'Could not load content from Supabase.');
    } finally {
      setLoading(false);
    }
  }, [applyLoaded]);

  useEffect(() => {
    load();
  }, [load]);

  const updateDraft = useCallback((updater) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = typeof updater === 'function' ? updater(prev) : updater;
      draftRef.current = next;
      return next;
    });
  }, []);

  const saveAll = useCallback(async (next) => {
    const payload = next ?? draftRef.current;
    if (!payload) return;

    setSaving(true);
    setError('');
    try {
      await api.saveContent(payload);
      applyLoaded(payload);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [applyLoaded]);

  const value = useMemo(() => ({
    content,
    draft,
    loading,
    saving,
    error,
    load,
    saveAll,
    updateDraft,
    setError,
  }), [
    content,
    draft,
    loading,
    saving,
    error,
    load,
    saveAll,
    updateDraft,
  ]);

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
}

export function useCms() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useCms must be used within ContentProvider');
  return ctx;
}
