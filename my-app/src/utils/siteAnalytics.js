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

async function updatePresence(path) {
  if (!supabase) return;

  await supabase.from('analytics_presence').upsert({
    session_id: getSessionId(),
    visitor_id: getVisitorId(),
    path,
    last_seen: new Date().toISOString(),
  });
}

export async function trackPageView(path) {
  if (!hasSupabaseConfig || !supabase) return;

  const sessionId = getSessionId();
  const viewedKey = `${VIEWED_PREFIX}${sessionId}`;

  try {
    if (!sessionStorage.getItem(viewedKey)) {
      const { error } = await supabase.from('analytics_page_views').insert({
        visitor_id: getVisitorId(),
        session_id: sessionId,
        path,
      });

      if (!error) {
        sessionStorage.setItem(viewedKey, '1');
      }
    }
  } catch {
    // Analytics should never block the portfolio.
  }

  try {
    await updatePresence(path);
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
