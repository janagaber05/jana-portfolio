export const HOME_WORK_LIMIT = 6;

export function normalizeProjectSlug(slug) {
  try {
    return decodeURIComponent(slug || '').trim().toLowerCase();
  } catch {
    return (slug || '').trim().toLowerCase();
  }
}

export function getProjectBySlug(projects, slug) {
  const target = normalizeProjectSlug(slug);
  if (!target) return undefined;

  return projects.find((project) => normalizeProjectSlug(project.slug) === target);
}

export function resolveHomeProjectSlugs(featuredWork, limit = HOME_WORK_LIMIT) {
  const projects = featuredWork?.projects || [];
  const max = featuredWork?.homeLimit ?? limit;
  const slugs = featuredWork?.homeProjectSlugs;

  if (Array.isArray(slugs) && slugs.length) {
    return slugs
      .filter((slug) => projects.some((project) => project.slug === slug))
      .slice(0, max);
  }

  return projects.slice(0, max).map((project) => project.slug);
}

export function getHomeProjects(projects, homeProjectSlugs, limit = HOME_WORK_LIMIT) {
  if (!projects?.length) return [];

  const slugs = resolveHomeProjectSlugs({ projects, homeProjectSlugs, homeLimit: limit }, limit);

  return slugs
    .map((slug) => getProjectBySlug(projects, slug))
    .filter(Boolean);
}

export function getHomeCountLabel(projects, homeProjectSlugs, limit = HOME_WORK_LIMIT) {
  const total = getHomeProjects(projects, homeProjectSlugs, limit).length;
  if (!total) return '00 — 00';
  const pad = (value) => String(value).padStart(2, '0');
  return `${pad(1)} — ${pad(total)}`;
}

export function getAdjacentProjects(projects, slug) {
  const index = projects.findIndex(
    (project) => normalizeProjectSlug(project.slug) === normalizeProjectSlug(slug),
  );

  return {
    prev: index > 0 ? projects[index - 1] : null,
    next: index < projects.length - 1 ? projects[index + 1] : null,
  };
}
