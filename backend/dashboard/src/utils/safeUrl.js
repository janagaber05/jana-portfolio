const DANGEROUS = /^(javascript|vbscript|data):/i;

/**
 * Allow only safe URL schemes for CMS-driven href/src values.
 * @param {unknown} value
 * @param {{ allowDataImage?: boolean, fallback?: string }} [options]
 */
export function safeUrl(value, options = {}) {
  const fallback = options.fallback ?? '';
  if (value == null) return fallback;

  const raw = String(value).trim();
  if (!raw) return fallback;

  if (DANGEROUS.test(raw)) {
    if (options.allowDataImage && /^data:image\//i.test(raw) && !/data:text\/html/i.test(raw)) {
      return raw;
    }
    return fallback;
  }

  if (raw.startsWith('/') && !raw.startsWith('//')) {
    return raw;
  }

  if (raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:')) {
    return raw;
  }

  try {
    const parsed = new URL(raw, 'https://example.invalid');
    const protocol = parsed.protocol.toLowerCase();
    if (protocol === 'https:' || protocol === 'http:') {
      if (raw.startsWith('//')) return fallback;
      return raw;
    }
  } catch {
    return fallback;
  }

  return fallback;
}

export function safeHref(value) {
  return safeUrl(value, { fallback: '#' });
}

export function safeMediaSrc(value) {
  return safeUrl(value, { allowDataImage: true, fallback: '' });
}

const ALLOWED_UPLOAD_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/avif',
  'video/mp4',
  'video/webm',
  'application/pdf',
]);

const ALLOWED_UPLOAD_EXT = new Set([
  'png', 'jpg', 'jpeg', 'webp', 'gif', 'avif', 'mp4', 'webm', 'pdf',
]);

export function assertSafeUpload(file, { maxBytes = 50 * 1024 * 1024 } = {}) {
  if (!file) throw new Error('No file selected');
  if (file.size > maxBytes) throw new Error('File is too large');

  const mime = String(file.type || '').toLowerCase();
  const ext = String(file.name || '').split('.').pop()?.toLowerCase() || '';

  if (!ALLOWED_UPLOAD_MIME.has(mime) || !ALLOWED_UPLOAD_EXT.has(ext)) {
    throw new Error('File type not allowed');
  }

  if (ext === 'svg' || ext === 'html' || ext === 'htm' || ext === 'js') {
    throw new Error('File type not allowed');
  }

  return ext;
}
