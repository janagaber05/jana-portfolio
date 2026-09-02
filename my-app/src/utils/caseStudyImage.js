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
  walkthrough: true,
  designProcess: true,
  finalDesign: true,
  outcomes: true,
};

export function mergeSectionVisibility(visibility = {}) {
  return { ...DEFAULT_SECTION_VISIBILITY, ...visibility };
}

export function isCaseStudySectionVisible(caseStudy, key) {
  const visibility = mergeSectionVisibility(caseStudy?.sectionVisibility);
  return visibility[key] !== false;
}

const PROGRESS_LABELS = {
  'section-overview': 'Overview',
  'section-role': 'My role',
  'section-research': 'Research',
  'section-quote': 'Quote',
  'section-walkthrough': 'Walkthrough',
  'section-process': 'Design process',
  'section-final': 'Final design',
  'section-outcomes': 'Outcomes',
};

const SECTION_KEY_BY_ID = {
  'section-overview': 'overview',
  'section-role': 'myRole',
  'section-research': 'research',
  'section-quote': 'quote',
  'section-walkthrough': 'walkthrough',
  'section-process': 'designProcess',
  'section-final': 'finalDesign',
  'section-outcomes': 'outcomes',
};

export function getVisibleProgressSections(caseStudy, walkthroughVideo) {
  return Object.entries(SECTION_KEY_BY_ID)
    .filter(([sectionId, key]) => {
      if (!isCaseStudySectionVisible(caseStudy, key)) return false;
      if (sectionId === 'section-walkthrough') return Boolean(walkthroughVideo);
      return true;
    })
    .map(([id, key]) => ({
      id,
      label: PROGRESS_LABELS[id] || key,
      key,
    }));
}

export { PROGRESS_LABELS };
