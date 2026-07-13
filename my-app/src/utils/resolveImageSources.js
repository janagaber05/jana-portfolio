export function resolveImageSources(imageUrl, candidates = [], fallback) {
  const local = [...candidates, fallback].filter(Boolean);
  if (imageUrl) return [imageUrl, ...local];
  return local;
}

export function getResolvedImageSrc(imageUrl, candidates = [], fallback) {
  const sources = resolveImageSources(imageUrl, candidates, fallback);
  return sources[0] || '';
}
