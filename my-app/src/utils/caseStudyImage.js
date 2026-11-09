import { getCoverImage } from './projectTheme';
import { resolveWalkthroughVideo } from './walkthroughVideo';

/** Normalized crop region (0–1) relative to the full image. */
export function normalizeDisplayCrop(pixelCrop, imageWidth, imageHeight) {
  if (!pixelCrop || !imageWidth || !imageHeight) return null;
  return {
    x: pixelCrop.x / imageWidth,
    y: pixelCrop.y / imageHeight,
    width: pixelCrop.width / imageWidth,
    height: pixelCrop.height / imageHeight,
  };
}

export function getScreenImageSrc(screen) {
  if (!screen) return '';
  return screen.fullImageUrl || screen.imageUrl || '';
}

export function getScreenLightboxSrc(screen) {
  return getScreenImageSrc(screen);
}

export function getScreenDisplayCrop(screen) {
  const crop = screen?.displayCrop;
  if (!crop || crop.width <= 0 || crop.height <= 0) return null;
  return crop;
}

export const DEFAULT_SECTION_VISIBILITY = {
  heroScreens: true,
  overview: true,
  myRole: true,
  research: true,
  quote: true,
  beforeAfter: true,
  walkthrough: true,
  designProcess: true,
  finalDesign: true,
  outcomes: true,
  reflection: true,
};

export function mergeSectionVisibility(visibility = {}) {
  return { ...DEFAULT_SECTION_VISIBILITY, ...visibility };
}

export function isCaseStudySectionVisible(caseStudy, key) {
  const visibility = mergeSectionVisibility(caseStudy?.sectionVisibility);
  return visibility[key] !== false;
}

function hasText(value) {
  return Boolean(String(value || '').trim());
}

function hasScreens(list) {
  return (list || []).some((item) => Boolean(getScreenImageSrc(item)));
}

function hasMetrics(list) {
  return (list || []).some((m) => hasText(m?.value) || hasText(m?.label));
}

function hasPersonas(list) {
  return (list || []).some((p) => (
    hasText(p?.name) || hasText(p?.role) || hasText(p?.goal)
    || hasText(p?.painPoint) || hasText(p?.behaviour) || hasText(p?.quote)
  ));
}

function hasInsights(list) {
  return (list || []).some((i) => hasText(i?.title) || hasText(i?.text));
}

/** Content-aware: section must be visible AND have something to show. */
export function caseStudyHasSectionContent(caseStudy, key, extras = {}) {
  if (!caseStudy) return false;
  switch (key) {
    case 'overview':
      return hasText(caseStudy.overview?.problemText) || hasText(caseStudy.overview?.solutionText);
    case 'myRole':
      return hasText(caseStudy.myRole?.intro) || (caseStudy.myRole?.pills || []).some(hasText);
    case 'research':
      return hasInsights(caseStudy.research?.insights) || hasPersonas(caseStudy.research?.personas);
    case 'quote':
      return hasText(caseStudy.quote?.text);
    case 'beforeAfter':
      return hasText(caseStudy.beforeAfter?.before) && hasText(caseStudy.beforeAfter?.after);
    case 'walkthrough':
      return Boolean(extras.walkthroughVideo || resolveWalkthroughVideo(caseStudy.walkthrough?.videoUrl));
    case 'designProcess':
      return hasScreens(caseStudy.designProcess?.stages);
    case 'finalDesign':
      return hasScreens(caseStudy.finalDesign?.screens);
    case 'outcomes':
      return hasMetrics(caseStudy.outcomes?.metrics);
    case 'reflection':
      return hasText(caseStudy.reflection?.text);
    case 'heroScreens':
      return hasScreens(caseStudy.heroScreens) || Boolean(getCoverImage(caseStudy));
    default:
      return true;
  }
}

export function shouldRenderCaseStudySection(caseStudy, key, extras = {}) {
  return isCaseStudySectionVisible(caseStudy, key)
    && caseStudyHasSectionContent(caseStudy, key, extras);
}

const PROGRESS_LABELS = {
  'section-overview': 'Overview',
  'section-role': 'My role',
  'section-research': 'Research',
  'section-quote': 'Quote',
  'section-before-after': 'Before / After',
  'section-walkthrough': 'Walkthrough',
  'section-process': 'Design process',
  'section-final': 'Final design',
  'section-outcomes': 'Outcomes',
  'section-reflection': 'Reflection',
};

const SECTION_KEY_BY_ID = {
  'section-overview': 'overview',
  'section-role': 'myRole',
  'section-research': 'research',
  'section-quote': 'quote',
  'section-before-after': 'beforeAfter',
  'section-walkthrough': 'walkthrough',
  'section-process': 'designProcess',
  'section-final': 'finalDesign',
  'section-outcomes': 'outcomes',
  'section-reflection': 'reflection',
};

export function getVisibleProgressSections(caseStudy, walkthroughVideo) {
  return Object.entries(SECTION_KEY_BY_ID)
    .filter(([, key]) => shouldRenderCaseStudySection(caseStudy, key, { walkthroughVideo }))
    .map(([id, key]) => ({
      id,
      label: PROGRESS_LABELS[id] || key,
      key,
    }));
}

export { PROGRESS_LABELS };
