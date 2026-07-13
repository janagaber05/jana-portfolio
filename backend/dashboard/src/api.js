import { STORAGE_BUCKET, supabase } from './lib/supabase';

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export const api = {
  login: async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload.error || 'Login failed');

    if (!payload.session) throw new Error('No session returned from server');

    const { error } = await supabase.auth.setSession(payload.session);
    if (error) throw new Error(error.message);

    return payload;
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  getContent: async () => {
    const { data, error } = await supabase
      .from('site_content')
      .select('data')
      .eq('id', 'main')
      .single();

    if (error) throw new Error(error.message);
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
