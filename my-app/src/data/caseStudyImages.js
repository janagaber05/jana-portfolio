const PROCESS_KEYS = ['process-low', 'process-mid', 'process-high'];
const FINAL_KEYS = ['final-home', 'final-detail', 'final-checkout'];
const HERO_KEYS = ['hero-1', 'hero-2', 'hero-3', 'hero-4', 'hero-5', 'hero-6'];

const IMAGE_EXTENSIONS = ['.webp', '.jpg', '.jpeg', '.png', '.svg'];

function getImageCandidates(folder, key) {
  const base = `${process.env.PUBLIC_URL}/case-studies/${folder}/${key}`;
  return IMAGE_EXTENSIONS.map((ext) => `${base}${ext}`);
}

function attachScreens(slug, screens, keys, fallbackFolder = '_defaults') {
  return screens.map((screen, index) => ({
    ...screen,
    imageCandidates: getImageCandidates(slug, keys[index] || `hero-${index + 1}`),
    fallbackImage: getImageCandidates(fallbackFolder, keys[index] || `hero-${index + 1}`)[IMAGE_EXTENSIONS.length - 1],
    alt: screen.alt || `${screen.label} for ${slug.replace(/-/g, ' ')}`,
  }));
}

export function attachCaseStudyImages(caseStudy, slug) {
  const withProcess = {
    ...caseStudy,
    designProcess: {
      ...caseStudy.designProcess,
      stages: attachScreens(slug, caseStudy.designProcess.stages, PROCESS_KEYS),
    },
    finalDesign: {
      ...caseStudy.finalDesign,
      screens: attachScreens(slug, caseStudy.finalDesign.screens, FINAL_KEYS),
    },
  };

  if (!caseStudy.heroScreens?.length) return withProcess;

  return {
    ...withProcess,
    heroScreens: attachScreens(slug, caseStudy.heroScreens, HERO_KEYS),
  };
}

export { IMAGE_EXTENSIONS, PROCESS_KEYS, FINAL_KEYS, HERO_KEYS };
