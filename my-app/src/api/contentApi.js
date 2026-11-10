import defaultContent from '../data/defaultContent.json';
import { mergeSiteContent } from '../utils/mergeContent';
import { hasSupabaseConfig, supabase } from '../lib/supabase';

const configuredApi = process.env.REACT_APP_API_URL;
const API_BASE = configuredApi || 'http://localhost:5001';
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const FETCH_TIMEOUT_MS = 8000;
const IS_DEV = process.env.NODE_ENV !== 'production';

function withTimeout(promise, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), FETCH_TIMEOUT_MS);
    }),
  ]);
}

async function fetchFromSupabase() {
  if (!hasSupabaseConfig || !supabase) {
    if (IS_DEV) {
      console.warn('[Portfolio] Supabase is not configured for this build.');
    }
    return null;
  }

  const { data, error } = await withTimeout(
    supabase
      .from('site_content')
      .select('data')
      .eq('id', 'main')
      .maybeSingle(),
    'Content request timed out',
  );

  if (error) throw new Error(error.message);
  if (!data?.data) throw new Error('No published site content found');

  return mergeSiteContent(data.data);
}

export async function fetchSiteContent() {
  try {
    const fromSupabase = await fetchFromSupabase();
    if (fromSupabase) return fromSupabase;
  } catch (err) {
    if (IS_DEV) console.warn('[Portfolio] Could not load from Supabase:', err.message);
  }

  // Local Express API (dev only). Never call localhost from the deployed site.
  const isBrowserLocal = typeof window !== 'undefined'
    && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if ((isBrowserLocal || IS_DEV) && (configuredApi || isBrowserLocal)) {
    try {
      const res = await fetch(`${API_BASE}/api/content`);
      if (!res.ok) throw new Error('API unavailable');
      return mergeSiteContent(await res.json());
    } catch (err) {
      if (IS_DEV) console.warn('[Portfolio] Could not load from local API:', err.message);
    }
  }

  try {
    const res = await fetch('/cms-default.json');
    if (res.ok) return mergeSiteContent(await res.json());
  } catch {
    // bundled default
  }

  return mergeSiteContent(defaultContent);
}

export { API_BASE, SUPABASE_URL, hasSupabaseConfig };
