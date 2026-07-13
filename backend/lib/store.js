import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defaultSite } from '../data/defaultSite.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const SITE_FILE = path.join(DATA_DIR, 'site.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function initStore() {
  ensureDataDir();
  if (!fs.existsSync(SITE_FILE)) {
    fs.writeFileSync(SITE_FILE, JSON.stringify(defaultSite, null, 2), 'utf8');
  }
}

export function readSite() {
  initStore();
  const raw = fs.readFileSync(SITE_FILE, 'utf8');
  return JSON.parse(raw);
}

export function writeSite(data) {
  ensureDataDir();
  fs.writeFileSync(SITE_FILE, JSON.stringify(data, null, 2), 'utf8');
  return data;
}

export function updateSection(section, value) {
  const site = readSite();
  site[section] = value;
  return writeSite(site);
}

export function patchSite(partial) {
  const site = readSite();
  const merged = deepMerge(site, partial);
  return writeSite(merged);
}

function deepMerge(target, source) {
  const output = { ...target };
  Object.keys(source).forEach((key) => {
    if (
      source[key]
      && typeof source[key] === 'object'
      && !Array.isArray(source[key])
      && target[key]
      && typeof target[key] === 'object'
      && !Array.isArray(target[key])
    ) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  });
  return output;
}
