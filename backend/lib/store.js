import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defaultSite } from '../data/defaultSite.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const SITE_FILE = path.join(DATA_DIR, 'site.json');

export const ALLOWED_SECTIONS = new Set([
  'hero',
  'featuredWork',
  'about',
  'disciplines',
  'process',
  'contact',
  'settings',
  'seo',
  'caseStudies',
]);

const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

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
  if (!ALLOWED_SECTIONS.has(section)) {
    throw new Error('Invalid section');
  }
  const site = readSite();
  site[section] = value;
  return writeSite(site);
}

export function patchSite(partial) {
  if (!partial || typeof partial !== 'object' || Array.isArray(partial)) {
    throw new Error('Invalid patch');
  }
  const site = readSite();
  const merged = deepMerge(site, partial);
  return writeSite(merged);
}

function deepMerge(target, source) {
  const output = { ...target };
  Object.keys(source).forEach((key) => {
    if (BLOCKED_KEYS.has(key)) return;
    if (
      source[key]
      && typeof source[key] === 'object'
      && !Array.isArray(source[key])
      && Object.getPrototypeOf(source[key]) === Object.prototype
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
