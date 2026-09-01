export function removeProjectFromDraft(prev, slug) {
  const current = prev.featuredWork;
  const projects = current.projects
    .filter((project) => project.slug !== slug)
    .map((project, index) => ({
      ...project,
      index: String(index + 1).padStart(2, '0'),
    }));
  const homeProjectSlugs = (current.homeProjectSlugs || []).filter((item) => item !== slug);
  const nextCaseStudies = { ...prev.caseStudies };
  delete nextCaseStudies[slug];

  return {
    ...prev,
    featuredWork: { ...current, projects, homeProjectSlugs },
    caseStudies: nextCaseStudies,
  };
}
