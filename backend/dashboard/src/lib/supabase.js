import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

function isPlaceholderEnv(value) {
  if (!value) return true;
  return /your-project|your_publishable|your_anon|change-this/i.test(value);
}

export const hasSupabaseConfig = Boolean(url && key && !isPlaceholderEnv(url) && !isPlaceholderEnv(key));

const noopSubscription = { unsubscribe: () => {} };

const missingConfigClient = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: (callback) => {
      queueMicrotask(() => callback('INITIAL_SESSION', null));
      return { data: { subscription: noopSubscription } };
    },
    signInWithPassword: async () => ({
      data: { session: null },
      error: { message: 'Missing Supabase configuration' },
    }),
    signOut: async () => ({ error: null }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({
          data: null,
          error: { message: 'Missing Supabase configuration' },
        }),
      }),
    }),
    upsert: async () => ({ error: { message: 'Missing Supabase configuration' } }),
  }),
  storage: {
    from: () => ({
      upload: async () => ({ error: { message: 'Missing Supabase configuration' } }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
      list: async () => ({ data: [], error: { message: 'Missing Supabase configuration' } }),
    }),
  },
};

export const supabase = hasSupabaseConfig
  ? createClient(url, key)
  : missingConfigClient;

export const STORAGE_BUCKET = 'portfolio-media';
