import { IMAGE_EXTENSIONS } from '../data/caseStudyImages';
import { resolveMediaUrl } from './mediaUrl';

const FALLBACK_KEYS = ['final-home', 'final-detail', 'final-checkout'];

const SLUG_THUMB_KEYS = {
  'e-commerce-redesign': 'final-checkout',
  'wellness-app': 'final-home',
  'fashion-lookbook': 'final-detail',
  'portfolio-system': 'final-home',
  'campaign-site': 'final-detail',
  'mobile-banking': 'final-checkout',
};

function buildCandidates(folder, key) {
  const base = `${process.env.PUBLIC_URL}/case-studies/${folder}/${key}`;
  return IMAGE_EXTENSIONS.map((ext) => `${base}${ext}`);
}

export function getProjectThumbnailSources(project, index = 0) {
  if (!project) return [];

  const custom = resolveMediaUrl(project.thumbnail);
  if (custom) return [custom];

  const key = SLUG_THUMB_KEYS[project.slug] || FALLBACK_KEYS[index % FALLBACK_KEYS.length];
  const slugCandidates = buildCandidates(project.slug, key);
  const defaultCandidates = buildCandidates('_defaults', key);

  return [...slugCandidates, ...defaultCandidates];
}
