/** Shared accent helpers for case-study theming. */

export function isLightColor(color) {
  const c = String(color || '').toUpperCase();
  const lights = ['#FCF4F0', '#FFD5FB', '#FFE8F9', '#F4CFC2'];
  if (lights.includes(c)) return true;
  if (c.startsWith('#') && c.length === 7) {
    const r = parseInt(c.slice(1, 3), 16);
    const g = parseInt(c.slice(3, 5), 16);
    const b = parseInt(c.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 170;
  }
  return false;
}

export function getProjectTheme(accent) {
  const accentColor = accent || '#6D0101';
  const light = isLightColor(accentColor);
  return {
    accent: accentColor,
    onAccent: light ? '#6D0101' : '#FCF4F0',
    ink: '#141214',
    cream: '#FCF4F0',
    pink: '#FFD5FB',
    light,
  };
}

export function getCoverImage(caseStudy, project) {
  return (
    caseStudy?.coverImage
    || caseStudy?.heroImage
    || caseStudy?.finalDesign?.screens?.find((s) => s?.fullImageUrl || s?.imageUrl)?.fullImageUrl
    || caseStudy?.finalDesign?.screens?.find((s) => s?.fullImageUrl || s?.imageUrl)?.imageUrl
    || project?.thumbnail
    || ''
  );
}

/** Crop for the hero phone frame — explicit cover crop, else first final screen crop. */
export function getCoverDisplayCrop(caseStudy) {
  // Lazy require avoided — duplicate the sanity checks from getScreenDisplayCrop
  // so full-width band crops don't blank the hero phone.
  const sane = (crop) => {
    if (!crop || !(crop.width > 0) || !(crop.height > 0)) return null;
    if (crop.width > 1.05 || crop.height > 1.05) return null;
    if (crop.x < -0.02 || crop.y < -0.02) return null;
    if (crop.x + crop.width > 1.05 || crop.y + crop.height > 1.05) return null;
    if (crop.width >= 0.9 && crop.height < 0.85) return null;
    return crop;
  };

  const coverCrop = sane(caseStudy?.coverDisplayCrop);
  if (coverCrop) return coverCrop;

  if (caseStudy?.coverImage || caseStudy?.heroImage) return null;

  const first = (caseStudy?.finalDesign?.screens || []).find(
    (s) => s?.fullImageUrl || s?.imageUrl,
  );
  return sane(first?.displayCrop);
}

export function parseMetricValue(raw) {
  const text = String(raw || '').trim();
  const match = text.match(/^([^0-9+-]*)([+-]?\d+(?:\.\d+)?)(.*)$/);
  if (!match) {
    return {
      prefix: '', number: null, suffix: text, display: text,
    };
  }
  return {
    prefix: match[1] || '',
    number: Number(match[2]),
    suffix: match[3] || '',
    display: text,
  };
}

export function truncateText(text, max = 140) {
  const value = String(text || '').trim();
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trim()}…`;
}
