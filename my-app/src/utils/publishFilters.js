export function isProjectPublished(project, now = Date.now()) {
  if (project?.published === false) return false;
  if (project?.publishAt) {
    const publishTime = new Date(project.publishAt).getTime();
    if (!Number.isNaN(publishTime) && publishTime > now) return false;
  }
  return true;
}

export function applyPublishFilters(content, now = Date.now()) {
  if (!content?.featuredWork) return content;

  const projects = (content.featuredWork.projects || []).filter((project) =>
    isProjectPublished(project, now),
  );
  const slugs = new Set(projects.map((project) => project.slug));
  const homeProjectSlugs = (content.featuredWork.homeProjectSlugs || []).filter((slug) =>
    slugs.has(slug),
  );

  const caseStudies = {};
  Object.entries(content.caseStudies || {}).forEach(([slug, study]) => {
    if (slugs.has(slug)) caseStudies[slug] = study;
  });

  return {
    ...content,
    featuredWork: {
      ...content.featuredWork,
      projects,
      homeProjectSlugs,
    },
    caseStudies,
  };
}

export function getAvailabilityLabel(content) {
  const availability = content?.settings?.availability;
  if (availability?.label) return availability.label;
  if (availability?.status === 'booked') return 'Fully booked';
  if (availability?.status === 'away') return 'Away — limited availability';
  return content?.contact?.availableBadge || 'Open for work';
}
