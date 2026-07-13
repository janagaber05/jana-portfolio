import { STORAGE_BUCKET, supabase } from './lib/supabase';

const REQUEST_TIMEOUT_MS = 12000;

function assertSupabaseConfig() {
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    throw new Error(
      'Missing Supabase settings. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel, then redeploy.',
    );
  }
}

function withTimeout(promise, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), REQUEST_TIMEOUT_MS);
    }),
  ]);
}

export async function getSession() {
  assertSupabaseConfig();
  const { data } = await withTimeout(
    supabase.auth.getSession(),
    'Session check timed out. Check your Supabase URL and network connection.',
  );
  return data.session;
}

export const api = {
  login: async (email, password) => {
    assertSupabaseConfig();
    const { data, error } = await withTimeout(
      supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      }),
      'Login timed out. Check your Supabase settings and network connection.',
    );

    if (error) throw new Error(error.message);
    if (!data.session) throw new Error('Login failed');

    return data;
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  getContent: async () => {
    assertSupabaseConfig();

    const { data, error } = await withTimeout(
      supabase
        .from('site_content')
        .select('data')
        .eq('id', 'main')
        .maybeSingle(),
      'Loading content timed out. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.',
    );

    if (error) throw new Error(error.message);
    if (!data?.data) throw new Error('No site content found in Supabase (site_content.main).');

    return data.data;
  },

  saveContent: async (content) => {
    const { error } = await supabase
      .from('site_content')
      .upsert({ id: 'main', data: content }, { onConflict: 'id' });

    if (error) throw new Error(error.message);
    return { success: true };
  },

  saveSection: async (section, sectionData) => {
    const site = await api.getContent();
    site[section] = sectionData;
    return api.saveContent(site);
  },

  upload: async (file) => {
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const path = `${Date.now()}-${safe}`;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return { url: data.publicUrl, filename: path };
  },

  listUploads: async () => {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) throw new Error(error.message);

    return (data || [])
      .filter((file) => file.name && !file.name.startsWith('.'))
      .map((file) => {
        const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(file.name);
        return { name: file.name, url: urlData.publicUrl };
      });
  },
};

export function mediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return path.startsWith('/') ? path : `/${path}`;
}
