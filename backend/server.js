import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { initStore, readSite, writeSite, patchSite, ALLOWED_SECTIONS } from './lib/store.js';
import { getSupabaseAdmin } from './lib/supabase.js';
import { requireAuth } from './middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5001;
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DASHBOARD_DIR = path.join(__dirname, 'dashboard', 'dist');
const IS_PROD = process.env.NODE_ENV === 'production';

const PLACEHOLDER_RE = /your-project|your_publishable|your_anon|your_secret|change-this|jana-admin-2026/i;

function assertEnvSafe() {
  const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  for (const key of required) {
    const value = process.env[key];
    if (!value || PLACEHOLDER_RE.test(value)) {
      if (IS_PROD) {
        console.error(`[backend] Refusing to start: ${key} is missing or a placeholder`);
        process.exit(1);
      }
    }
  }
  if (process.env.JWT_SECRET && PLACEHOLDER_RE.test(process.env.JWT_SECRET)) {
    console.warn('[backend] JWT_SECRET is unused and looks like a placeholder — remove it from .env');
  }
}

assertEnvSafe();

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

initStore();

const ALLOWED_MIME = new Map([
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
  ['image/avif', 'avif'],
  ['video/mp4', 'mp4'],
  ['video/webm', 'webm'],
  ['application/pdf', 'pdf'],
]);

const ALLOWED_EXT = new Set([...ALLOWED_MIME.values(), 'jpeg']);

function corsOriginAllowlist() {
  const raw = process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:3000,http://localhost:5173';
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = ALLOWED_MIME.get(file.mimetype) || 'bin';
    cb(null, `${crypto.randomUUID()}.${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const mime = String(file.mimetype || '').toLowerCase();
    const ext = String(file.originalname || '').split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_MIME.has(mime) || !ALLOWED_EXT.has(ext) || ext === 'svg' || ext === 'html' || ext === 'htm' || ext === 'js') {
      return cb(new Error('File type not allowed'));
    }
    return cb(null, true);
  },
});

app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin(origin, callback) {
    const allow = corsOriginAllowlist();
    if (!origin || allow.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

app.use('/uploads', (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const ext = path.extname(req.path).toLowerCase();
  if (['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif'].includes(ext)) {
    res.setHeader('Content-Disposition', 'inline');
  } else {
    res.setHeader('Content-Disposition', 'attachment');
  }
  next();
}, express.static(UPLOADS_DIR));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again later.' },
});

const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests' },
});

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}

function rejectDangerousKeys(value, depth = 0) {
  if (!value || typeof value !== 'object' || depth > 20) return;
  if (Array.isArray(value)) {
    value.forEach((item) => rejectDangerousKeys(item, depth + 1));
    return;
  }
  for (const key of Object.keys(value)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      throw new Error('Invalid payload');
    }
    rejectDangerousKeys(value[key], depth + 1);
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/', (_req, res) => {
  res.redirect(302, '/admin');
});

app.get('/api/content', (_req, res) => {
  res.json(readSite());
});

app.put('/api/content', requireAuth, writeLimiter, (req, res) => {
  try {
    if (!isPlainObject(req.body)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    rejectDangerousKeys(req.body);
    writeSite(req.body);
    return res.json({ success: true });
  } catch (error) {
    console.error('[api] PUT /api/content failed:', error.message);
    return res.status(500).json({ error: 'Could not save content' });
  }
});

app.patch('/api/content', requireAuth, writeLimiter, (req, res) => {
  try {
    if (!isPlainObject(req.body)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    rejectDangerousKeys(req.body);
    const updated = patchSite(req.body);
    return res.json(updated);
  } catch (error) {
    console.error('[api] PATCH /api/content failed:', error.message);
    return res.status(500).json({ error: 'Could not patch content' });
  }
});

app.put('/api/content/:section', requireAuth, writeLimiter, (req, res) => {
  try {
    const section = String(req.params.section || '');
    if (!ALLOWED_SECTIONS.has(section)) {
      return res.status(400).json({ error: 'Invalid section' });
    }
    if (req.body == null) {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    rejectDangerousKeys(req.body);
    const site = readSite();
    site[section] = req.body;
    writeSite(site);
    return res.json({ success: true, section });
  } catch (error) {
    console.error('[api] PUT /api/content/:section failed:', error.message);
    return res.status(500).json({ error: 'Could not save section' });
  }
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!email || !password) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data?.session) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { createClient } = await import('@supabase/supabase-js');
    const authed = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: isAdmin } = await authed.rpc('is_admin');
    if (isAdmin !== true) {
      await authed.auth.signOut().catch(() => {});
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    return res.json({ session: data.session, user: data.user });
  } catch (error) {
    console.error('[api] login failed:', error.message);
    return res.status(401).json({ error: 'Invalid email or password' });
  }
});

app.post('/api/upload', requireAuth, writeLimiter, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('[api] upload rejected:', err.message);
      return res.status(400).json({ error: 'Upload rejected' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    return res.json({
      url: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
    });
  });
});

app.get('/api/uploads', requireAuth, (_req, res) => {
  const files = fs.readdirSync(UPLOADS_DIR).map((name) => ({
    name,
    url: `/uploads/${name}`,
  }));
  res.json(files);
});

if (fs.existsSync(DASHBOARD_DIR)) {
  const adminStatic = express.static(DASHBOARD_DIR);
  app.use('/admin', (req, res, next) => {
    adminStatic(req, res, () => {
      res.sendFile(path.join(DASHBOARD_DIR, 'index.html'));
    });
  });
}

const host = IS_PROD ? '127.0.0.1' : '0.0.0.0';
const server = app.listen(PORT, host, () => {
  console.log(`API running at http://localhost:${PORT}`);
  if (fs.existsSync(DASHBOARD_DIR)) {
    console.log(`Dashboard at http://localhost:${PORT}/admin`);
  } else {
    console.log(`CMS in dev: http://localhost:5173/admin/`);
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nPort ${PORT} is already in use.`);
    console.error(`Free it with: lsof -ti :${PORT} | xargs kill\n`);
    process.exit(1);
  }
  throw err;
});
