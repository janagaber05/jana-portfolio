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

const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const contentRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getContent();
      const merged = mergeSiteContent(data);
      contentRef.current = merged;
      setContent(merged);
    } catch (err) {
      const merged = mergeSiteContent(defaultContent);
      contentRef.current = merged;
      setContent(merged);
      setError(err.message || 'Could not load content from Supabase.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveAll = useCallback(async (next) => {
    setSaving(true);
    setError('');
    try {
      await api.saveContent(next);
      contentRef.current = next;
      setContent(next);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const update = useCallback((updater) => {
    setContent((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      contentRef.current = next;
      return next;
    });
  }, []);

  const value = useMemo(() => ({
    content,
    loading,
    saving,
    error,
    load,
    saveAll,
    update,
    setError,
  }), [
    content,
    loading,
    saving,
    error,
    load,
    saveAll,
    update,
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
