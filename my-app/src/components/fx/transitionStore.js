/** In-memory slip → case-study FLIP transition payload (not persisted). */

let payload = null;

export function setProjectTransition(next) {
  payload = next && next.slug ? {
    slug: next.slug,
    color: next.color || '#6D0101',
    title: next.title || '',
    rect: next.rect ? {
      top: next.rect.top,
      left: next.rect.left,
      width: next.rect.width,
      height: next.rect.height,
    } : null,
  } : null;
}

export function consumeProjectTransition(slug) {
  if (!payload || payload.slug !== slug) return null;
  const next = payload;
  payload = null;
  return next;
}

export function peekProjectTransition() {
  return payload;
}

export function clearProjectTransition() {
  payload = null;
}
