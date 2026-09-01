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

function snapshotsEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function ContentProvider({ children }) {
  const [published, setPublished] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const draftRef = useRef(null);
  const publishedRef = useRef(null);

  const applyLoaded = useCallback((nextPublished, nextDraft) => {
    const mergedPublished = mergeSiteContent(nextPublished);
    const mergedDraft = mergeSiteContent(nextDraft || nextPublished);
    publishedRef.current = mergedPublished;
    draftRef.current = mergedDraft;
    setPublished(mergedPublished);
    setDraft(mergedDraft);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [live, working] = await Promise.all([
        api.getPublishedContent(),
        api.getDraftContent(),
      ]);
      applyLoaded(live, working);
    } catch (err) {
      const fallback = mergeSiteContent(defaultContent);
      applyLoaded(fallback, fallback);
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

  const saveDraft = useCallback(async (next) => {
    const payload = next ?? draftRef.current;
    if (!payload) return;

    setSaving(true);
    setError('');
    try {
      await api.saveDraft(payload);
      draftRef.current = payload;
      setDraft(payload);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const publish = useCallback(async (next) => {
    const payload = next ?? draftRef.current;
    if (!payload) return;

    setPublishing(true);
    setError('');
    try {
      await api.publishContent(payload);
      publishedRef.current = payload;
      draftRef.current = payload;
      setPublished(payload);
      setDraft(payload);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setPublishing(false);
    }
  }, []);

  const discardDraft = useCallback(() => {
    if (!publishedRef.current) return;
    const reset = cloneContent(publishedRef.current);
    draftRef.current = reset;
    setDraft(reset);
  }, []);

  const restoreRevisionToDraft = useCallback(async (revisionId) => {
    const content = await api.restoreRevision(revisionId);
    const merged = mergeSiteContent(content);
    draftRef.current = merged;
    setDraft(merged);
    return merged;
  }, []);

  const hasUnpublishedChanges = useMemo(() => {
    if (!draft || !published) return false;
    return !snapshotsEqual(draft, published);
  }, [draft, published]);

  const value = useMemo(() => ({
    content: published,
    published,
    draft,
    loading,
    saving,
    publishing,
    error,
    hasUnpublishedChanges,
    load,
    saveDraft,
    publish,
    discardDraft,
    restoreRevisionToDraft,
    updateDraft,
    setError,
    saveAll: publish,
  }), [
    published,
    draft,
    loading,
    saving,
    publishing,
    error,
    hasUnpublishedChanges,
    load,
    saveDraft,
    publish,
    discardDraft,
    restoreRevisionToDraft,
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
