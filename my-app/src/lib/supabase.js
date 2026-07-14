import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn(
    '[Portfolio] Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY. '
    + 'CMS edits will not appear until these are set and the app is rebuilt.',
  );
}

export const supabase = (url && key)
  ? createClient(url, key)
  : null;

export const hasSupabaseConfig = Boolean(url && key);
