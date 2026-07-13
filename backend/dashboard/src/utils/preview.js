const PREVIEW_ORIGIN = import.meta.env.VITE_PREVIEW_URL || 'http://localhost:3000';

const SECTION_BY_ROUTE = {
  '/hero': 'home',
  '/work': 'work',
  '/about': 'about',
  '/disciplines': 'disciplines',
  '/process': 'process',
  '/contact': 'contact',
};

export function getPreviewConfig(pathname) {
  const caseStudyMatch = pathname.match(/\/work\/case-study\/([^/]+)/);
  if (caseStudyMatch) {
    return {
      src: `${PREVIEW_ORIGIN}/preview/work/${caseStudyMatch[1]}`,
      scrollTo: null,
    };
  }

  const projectMatch = pathname.match(/\/work\/project\/([^/]+)/);
  if (projectMatch) {
    return {
      src: `${PREVIEW_ORIGIN}/preview/work/${projectMatch[1]}`,
      scrollTo: null,
    };
  }

  const route = Object.keys(SECTION_BY_ROUTE).find(
    (key) => pathname === key || pathname.startsWith(`${key}/`),
  );

  const scrollTo = route ? SECTION_BY_ROUTE[route] : null;
  const hash = scrollTo ? `#${scrollTo}` : '';

  return {
    src: `${PREVIEW_ORIGIN}/preview${hash}`,
    scrollTo,
  };
}

export function getMoreWorkPreviewUrl() {
  return `${PREVIEW_ORIGIN}/preview/work`;
}

export { PREVIEW_ORIGIN };
