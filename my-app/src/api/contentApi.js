import defaultContent from '../data/defaultContent.json';
import { mergeSiteContent } from '../utils/mergeContent';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

async function fetchFromSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/site_content?select=data&id=eq.main`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    },
  );

  if (!res.ok) throw new Error('Supabase unavailable');

  const rows = await res.json();
  if (!rows?.[0]?.data) throw new Error('No site content in Supabase');

  return mergeSiteContent(rows[0].data);
}

export async function fetchSiteContent() {
  try {
    const fromSupabase = await fetchFromSupabase();
    if (fromSupabase) return fromSupabase;
  } catch {
    // try local API next
  }

  try {
    const res = await fetch(`${API_BASE}/api/content`);
    if (!res.ok) throw new Error('API unavailable');
    return mergeSiteContent(await res.json());
  } catch {
    try {
      const res = await fetch('/cms-default.json');
      if (res.ok) return mergeSiteContent(await res.json());
    } catch {
      // use bundled default
    }
    return mergeSiteContent(defaultContent);
  }
}

export { API_BASE, SUPABASE_URL };
