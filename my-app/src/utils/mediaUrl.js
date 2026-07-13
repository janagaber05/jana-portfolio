export function resolveMediaUrl(path, fallback) {
  if (!path) return fallback;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads')) {
    const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    return `${API_BASE}${path}`;
  }
  return path;
}
