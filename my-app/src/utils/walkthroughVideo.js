import { safeMediaSrc } from './safeUrl';

const FILE_RE = /\.(mp4|webm|mov|m4v)(\?|#|$)/i;
const SUPABASE_HOST_RE = /\.supabase\.co$/i;

function isAllowedFileUrl(url) {
  try {
    if (url.startsWith('/')) return FILE_RE.test(url);
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    return FILE_RE.test(parsed.pathname) || SUPABASE_HOST_RE.test(parsed.hostname);
  } catch {
    return false;
  }
}

/**
 * Resolve a video URL into either a file player or an embed iframe.
 */
export function resolveWalkthroughVideo(url) {
  const trimmed = safeMediaSrc(url);
  if (!trimmed) return null;

  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  if (ytMatch) {
    return {
      type: 'iframe',
      src: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`,
      title: 'YouTube walkthrough',
    };
  }

  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return {
      type: 'iframe',
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      title: 'Vimeo walkthrough',
    };
  }

  if (!isAllowedFileUrl(trimmed)) return null;

  return {
    type: 'file',
    src: trimmed,
    title: 'Project walkthrough',
  };
}
