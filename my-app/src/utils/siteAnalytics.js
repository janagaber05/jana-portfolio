import { hasSupabaseConfig, supabase } from '../lib/supabase';

const VISITOR_KEY = 'jana:visitorId';
const SESSION_KEY = 'jana:sessionId';
const VIEWED_PREFIX = 'jana:viewed:';

function getOrCreateId(storage, key) {
  try {
    let id = storage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      storage.setItem(key, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

function getVisitorId() {
  return getOrCreateId(localStorage, VISITOR_KEY);
}

function getSessionId() {
  return getOrCreateId(sessionStorage, SESSION_KEY);
}

function sanitizePath(path) {
  let next = String(path || '/').trim().slice(0, 300);
  if (!next.startsWith('/')) next = `/${next}`;
  return next;
}

async function updatePresence(path) {
  if (!supabase) return;

  // RPC (not upsert): anon has no SELECT on analytics_presence, which upsert needs.
  await supabase.rpc('track_presence', {
    p_session_id: getSessionId(),
    p_visitor_id: getVisitorId(),
    p_path: sanitizePath(path),
  });
}

export async function trackPageView(path) {
  if (!hasSupabaseConfig || !supabase) return;

  const sessionId = getSessionId();
  const viewedKey = `${VIEWED_PREFIX}${sessionId}`;
  const cleanPath = sanitizePath(path);

  try {
    if (!sessionStorage.getItem(viewedKey)) {
      const { error } = await supabase.from('analytics_page_views').insert({
        visitor_id: getVisitorId(),
        session_id: sessionId,
        path: cleanPath,
      });

      if (!error) {
        sessionStorage.setItem(viewedKey, '1');
      }
    }
  } catch {
    // Analytics should never block the portfolio.
  }

  try {
    await updatePresence(cleanPath);
  } catch {
    // ignore
  }
}

export function startAnalyticsHeartbeat(getPath) {
  if (!hasSupabaseConfig || !supabase) return () => {};

  const tick = () => {
    updatePresence(getPath()).catch(() => {});
  };

  tick();
  const intervalId = window.setInterval(tick, 30000);

  const onVisibilityChange = () => {
    if (!document.hidden) tick();
  };

  document.addEventListener('visibilitychange', onVisibilityChange);

  return () => {
    window.clearInterval(intervalId);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}
