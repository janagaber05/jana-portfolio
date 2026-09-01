import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useCms } from '../context/ContentContext';
import { openPreview } from '../utils/previewDraft';

export function useContentDraft() {
  const {
    draft,
    updateDraft,
    saveDraft,
    publish,
    saving,
    publishing,
    hasUnpublishedChanges,
  } = useCms();
  const location = useLocation();

  const save = useCallback(async () => {
    if (!draft) return;
    await saveDraft(draft);
  }, [draft, saveDraft]);

  const publishLive = useCallback(async () => {
    if (!draft) return;
    await publish(draft);
  }, [draft, publish]);

  const preview = useCallback(() => {
    if (!draft) return;
    const path = location.pathname.includes('/work/project/')
      ? `/work/${location.pathname.split('/').pop()}`
      : '/';
    openPreview(draft, path);
  }, [draft, location.pathname]);

  return {
    draft,
    updateDraft,
    save,
    saveDraft: save,
    publish: publishLive,
    preview,
    saving,
    publishing,
    hasUnpublishedChanges,
    ready: Boolean(draft),
  };
}
