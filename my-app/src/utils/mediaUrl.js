import { safeMediaSrc } from './safeUrl';

function apiBase() {
  const configured = process.env.REACT_APP_API_URL;
  if (configured) return configured.replace(/\/$/, '');
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5001';
    }
  }
  return '';
}

export function resolveMediaUrl(path, fallback) {
  const safeFallback = safeMediaSrc(fallback) || fallback || '';
  if (!path) return safeFallback;

  const value = String(path).trim();
  if (!value) return safeFallback;

  if (value.startsWith('/uploads')) {
    const base = apiBase();
    if (!base) return safeFallback;
    return safeMediaSrc(`${base}${value}`) || safeFallback;
  }

  return safeMediaSrc(value) || safeFallback;
}
