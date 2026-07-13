import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api';
import { mergeSiteContent } from '../utils/mergeContent';

const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getContent();
      setContent(mergeSiteContent(data));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveAll = async (next) => {
    setSaving(true);
    setError('');
    try {
      await api.saveContent(next);
      setContent(next);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const update = (updater) => {
    setContent((prev) => (typeof updater === 'function' ? updater(prev) : updater));
  };

  return (
    <ContentContext.Provider value={{
      content, loading, saving, error, load, saveAll, update, setError,
    }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useCms() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useCms must be used within ContentProvider');
  return ctx;
}
