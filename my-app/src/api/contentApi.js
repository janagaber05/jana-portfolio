import defaultContent from '../data/defaultContent.json';
import { mergeSiteContent } from '../utils/mergeContent';
import { hasSupabaseConfig, supabase } from '../lib/supabase';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;

async function fetchFromSupabase() {
  if (!hasSupabaseConfig || !supabase) {
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        '[Portfolio] Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY. '
        + 'Add both in Vercel (Portfolio project) → Settings → Environment Variables, then Redeploy.',
      );
    }
    return null;
  }

  const { data, error } = await supabase
    .from('site_content')
    .select('data')
    .eq('id', 'main')
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data?.data) throw new Error('No site content in Supabase (site_content.main)');

  return mergeSiteContent(data.data);
}

export async function fetchSiteContent() {
  try {
    const fromSupabase = await fetchFromSupabase();
    if (fromSupabase) return fromSupabase;
  } catch (err) {
    console.warn('[Portfolio] Could not load from Supabase:', err.message);
  }

  // Local Express API (dev only). Never call localhost from the deployed site.
  const isBrowserLocal = typeof window !== 'undefined'
    && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (isBrowserLocal || process.env.NODE_ENV !== 'production') {
    try {
      const res = await fetch(`${API_BASE}/api/content`);
      if (!res.ok) throw new Error('API unavailable');
      return mergeSiteContent(await res.json());
    } catch (err) {
      console.warn('[Portfolio] Could not load from local API:', err.message);
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
