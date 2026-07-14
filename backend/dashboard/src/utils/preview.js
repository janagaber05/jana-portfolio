const PORTFOLIO_ORIGIN = import.meta.env.VITE_PREVIEW_URL || 'http://localhost:3000';

export function getMoreWorkUrl() {
  return `${PORTFOLIO_ORIGIN}/work`;
}

export function getProjectUrl(slug) {
  return `${PORTFOLIO_ORIGIN}/work/${slug}`;
}

export { PORTFOLIO_ORIGIN };
