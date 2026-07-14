import { useCallback } from 'react';
import { useCms } from '../context/ContentContext';

/** Shared draft from ContentProvider — survives navigation between editor pages. */
export function useContentDraft() {
  const { draft, updateDraft, saveAll, saving } = useCms();

  const save = useCallback(async () => {
    if (!draft) return;
    await saveAll(draft);
  }, [draft, saveAll]);

  return {
    draft,
    updateDraft,
    save,
    saving,
    ready: Boolean(draft),
  };
}
