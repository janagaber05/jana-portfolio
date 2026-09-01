export const PREVIEW_KEY = 'jana:cmsPreviewDraft';

export function readPreviewDraft() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('preview') !== '1') return null;
    const raw = sessionStorage.getItem(PREVIEW_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
