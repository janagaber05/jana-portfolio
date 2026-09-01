import { STORAGE_BUCKET, hasSupabaseConfig, supabase } from './lib/supabase';

const REQUEST_TIMEOUT_MS = 12000;
const DRAFT_ID = 'draft';
const MAIN_ID = 'main';

function assertSupabaseConfig() {
  if (!hasSupabaseConfig) {
    throw new Error(
      'Missing Supabase settings. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to backend/dashboard/.env, then restart.',
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

async function fetchContentRow(id) {
  const { data, error } = await supabase
    .from('site_content')
    .select('data')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.data || null;
}

async function upsertContentRow(id, content) {
  const { error } = await supabase
    .from('site_content')
    .upsert({ id, data: content }, { onConflict: 'id' });

  if (error) throw new Error(error.message);
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

  getPublishedContent: async () => {
    assertSupabaseConfig();
    const data = await withTimeout(
      fetchContentRow(MAIN_ID),
      'Loading published content timed out.',
    );
    if (!data) throw new Error('No site content found in Supabase (site_content.main).');
    return data;
  },

  getDraftContent: async () => {
    assertSupabaseConfig();
    const [published, draft] = await withTimeout(
      Promise.all([fetchContentRow(MAIN_ID), fetchContentRow(DRAFT_ID)]),
      'Loading draft content timed out.',
    );

    if (!published) throw new Error('No site content found in Supabase (site_content.main).');
    return draft || published;
  },

  getContent: async () => api.getDraftContent(),

  saveDraft: async (content) => {
    assertSupabaseConfig();
    await upsertContentRow(DRAFT_ID, content);
    try {
      await api.logActivity('draft_saved', 'Saved draft changes');
    } catch {
      // activity log is optional until 09_cms_features.sql is run
    }
    return { success: true };
  },

  publishContent: async (content) => {
    assertSupabaseConfig();
    const session = await getSession();
    const userId = session?.user?.id || null;

    await upsertContentRow(MAIN_ID, content);
    await upsertContentRow(DRAFT_ID, content);

    const { error: revisionError } = await supabase.from('site_content_revisions').insert({
      content,
      label: `Published ${new Date().toLocaleString()}`,
      created_by: userId,
    });

    if (revisionError) {
      console.warn('Could not save revision:', revisionError.message);
    }

    try {
      await api.logActivity('published', 'Published changes to live site');
    } catch {
      // optional
    }
    return { success: true };
  },

  saveContent: async (content) => api.publishContent(content),

  saveSection: async (section, sectionData) => {
    const site = await api.getDraftContent();
    site[section] = sectionData;
    return api.saveDraft(site);
  },

  getRevisions: async () => {
    assertSupabaseConfig();
    const { data, error } = await supabase
      .from('site_content_revisions')
      .select('id, label, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw new Error(error.message);
    return data || [];
  },

  getRevision: async (id) => {
    assertSupabaseConfig();
    const { data, error } = await supabase
      .from('site_content_revisions')
      .select('id, label, content, created_at')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Revision not found');
    return data;
  },

  restoreRevision: async (id) => {
    const revision = await api.getRevision(id);
    await api.saveDraft(revision.content);
    await api.logActivity('revision_restored', revision.label || `Revision #${id}`);
    return revision.content;
  },

  logActivity: async (action, detail = '') => {
    if (!hasSupabaseConfig) return;
    const session = await getSession().catch(() => null);
    if (!session?.user?.id) return;

    await supabase.from('cms_activity_log').insert({
      action,
      detail,
      created_by: session.user.id,
    });
  },

  getActivity: async () => {
    assertSupabaseConfig();
    const { data, error } = await supabase
      .from('cms_activity_log')
      .select('id, action, detail, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw new Error(error.message);
    return data || [];
  },

  getContactSubmissions: async () => {
    assertSupabaseConfig();
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('id, name, email, message, read_at, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw new Error(error.message);
    return data || [];
  },

  markSubmissionRead: async (id) => {
    assertSupabaseConfig();
    const { error } = await supabase
      .from('contact_submissions')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(error.message);
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

  getAnalytics: async () => {
    assertSupabaseConfig();
    const { data, error } = await withTimeout(
      supabase.rpc('get_site_analytics'),
      'Loading analytics timed out.',
    );

    if (error) throw new Error(error.message);
    return data;
  },
};

export function mediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return path.startsWith('/') ? path : `/${path}`;
}
