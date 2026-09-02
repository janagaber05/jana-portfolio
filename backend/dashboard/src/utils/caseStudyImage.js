export function normalizeDisplayCrop(pixelCrop, imageWidth, imageHeight) {
  if (!pixelCrop || !imageWidth || !imageHeight) return null;
  return {
    x: pixelCrop.x / imageWidth,
    y: pixelCrop.y / imageHeight,
    width: pixelCrop.width / imageWidth,
    height: pixelCrop.height / imageHeight,
  };
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
