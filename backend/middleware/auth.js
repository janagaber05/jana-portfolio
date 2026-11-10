import { createClient } from '@supabase/supabase-js';

function createUserClient(token) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  }
  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Verify Bearer token via Supabase and require public.is_admin(). */
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = header.slice(7).trim();
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const supabase = createUserClient(token);
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin');
    if (rpcError || isAdmin !== true) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    req.user = data.user;
    req.accessToken = token;
    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
