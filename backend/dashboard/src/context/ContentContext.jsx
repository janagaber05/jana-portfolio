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

const PREVIEW_DEBOUNCE_MS = 2000;

const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  const [content, setContent] = useState(null);
  const [previewContent, setPreviewContent] = useState(null);
  const [previewStale, setPreviewStale] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const previewDebounceRef = useRef(null);
  const contentRef = useRef(null);

  const syncPreview = useCallback((next) => {
    clearTimeout(previewDebounceRef.current);
    setPreviewContent(next);
    setPreviewStale(false);
  }, []);

  const schedulePreviewSync = useCallback((next) => {
    setPreviewStale(true);
    clearTimeout(previewDebounceRef.current);
    previewDebounceRef.current = window.setTimeout(() => {
      setPreviewContent(next);
      setPreviewStale(false);
    }, PREVIEW_DEBOUNCE_MS);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getContent();
      const merged = mergeSiteContent(data);
      contentRef.current = merged;
      setContent(merged);
      syncPreview(merged);
    } catch (err) {
      const merged = mergeSiteContent(defaultContent);
      contentRef.current = merged;
      setContent(merged);
      syncPreview(merged);
      setError(err.message || 'Could not load content from Supabase.');
    } finally {
      setLoading(false);
    }
  }, [syncPreview]);

  useEffect(() => {
    load();
  }, [load]);

  const refreshPreview = useCallback(() => {
    if (!contentRef.current) return;
    syncPreview(contentRef.current);
  }, [syncPreview]);

  const saveAll = async (next) => {
    setSaving(true);
    setError('');
    try {
      await api.saveContent(next);
      contentRef.current = next;
      setContent(next);
      syncPreview(next);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const update = useCallback((updater) => {
    setContent((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      contentRef.current = next;
      schedulePreviewSync(next);
      return next;
    });
  }, [schedulePreviewSync]);

  const value = useMemo(() => ({
    content,
    previewContent,
    previewStale,
    loading,
    saving,
    error,
    load,
    saveAll,
    update,
    refreshPreview,
    setError,
  }), [
    content,
    previewContent,
    previewStale,
    loading,
    saving,
    error,
    load,
    saveAll,
    update,
    refreshPreview,
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
