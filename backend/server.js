import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { initStore, readSite, writeSite, patchSite } from './lib/store.js';
import { getSupabaseAdmin } from './lib/supabase.js';
import { requireAuth } from './middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5001;
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DASHBOARD_DIR = path.join(__dirname, 'dashboard', 'dist');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

initStore();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
});

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/', (_req, res) => {
  res.redirect('/admin');
});

app.get('/api/content', (_req, res) => {
  res.json(readSite());
});

app.put('/api/content', requireAuth, (req, res) => {
  try {
    writeSite(req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/content', requireAuth, (req, res) => {
  try {
    const updated = patchSite(req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/content/:section', requireAuth, (req, res) => {
  try {
    const site = readSite();
    site[req.params.section] = req.body;
    writeSite(site);
    res.json({ success: true, section: req.params.section });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({ session: data.session, user: data.user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.json({
    url: `/uploads/${req.file.filename}`,
    filename: req.file.filename,
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

const server = app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
  if (fs.existsSync(DASHBOARD_DIR)) {
    console.log(`Dashboard at http://localhost:${PORT}/admin`);
  } else {
    console.log('Dashboard not built — run: npm run dashboard:build');
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nPort ${PORT} is already in use.`);
    console.error('Another backend instance is probably still running.');
    console.error(`Free it with: lsof -ti :${PORT} | xargs kill\n`);
    process.exit(1);
  }
  throw err;
});
