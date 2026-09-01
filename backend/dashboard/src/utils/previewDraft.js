const PREVIEW_KEY = 'jana:cmsPreviewDraft';

export function openPreview(draft, path = '/') {
  try {
    sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(draft));
  } catch {
    // ignore quota errors
  }

  const origin = import.meta.env.VITE_PREVIEW_URL || 'http://localhost:3000';
  const url = new URL(path, origin);
  url.searchParams.set('preview', '1');
  window.open(url.toString(), '_blank', 'noopener,noreferrer');
}

export { PREVIEW_KEY };
