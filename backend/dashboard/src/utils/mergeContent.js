import defaultContent from '../data/defaultContent.json';

function normalizeProject(project) {
  return {
    published: project.published !== false,
    publishAt: project.publishAt || null,
    seo: {
      title: '',
      description: '',
      ogImage: '',
      ...(project.seo || {}),
    },
    ...project,
  };
}

function mergeProjects(defaultProjects, loadedProjects) {
  const defaults = (defaultProjects || []).map(normalizeProject);

  if (!Array.isArray(loadedProjects)) {
    return defaults;
  }

  if (loadedProjects.length === 0) {
    return [];
  }

  return loadedProjects.map((project) => {
    const template = defaults.find(
      (item) => item.slug === project.slug || (item.id && item.id === project.id),
    );
    return normalizeProject(template ? { ...template, ...project } : project);
  });
}

function normalizeFeaturedWork(defaults, loaded) {
  const merged = { ...defaults, ...loaded };
  const projects = mergeProjects(defaults.projects, loaded?.projects);
  const homeLimit = merged.homeLimit ?? defaults.homeLimit ?? 6;
  let homeProjectSlugs = loaded?.homeProjectSlugs;

  if (!Array.isArray(homeProjectSlugs) || !homeProjectSlugs.length) {
    homeProjectSlugs = projects.slice(0, homeLimit).map((project) => project.slug);
  } else {
    homeProjectSlugs = homeProjectSlugs
      .filter((slug) => projects.some((project) => project.slug === slug))
      .slice(0, homeLimit);
  }

  return { ...merged, projects, homeProjectSlugs };
}

function mergeSection(defaults, loaded) {
  if (!loaded || typeof loaded !== 'object') return defaults;
  return { ...defaults, ...loaded };
}

export function mergeSiteContent(loaded) {
  if (!loaded) return structuredClone(defaultContent);

  return {
    ...defaultContent,
    ...loaded,
    meta: {
      ...mergeSection(defaultContent.meta, loaded.meta),
      seo: mergeSection(defaultContent.meta?.seo || {}, loaded.meta?.seo),
      pageSeo: {
        home: mergeSection(defaultContent.meta?.pageSeo?.home || {}, loaded.meta?.pageSeo?.home),
        work: mergeSection(defaultContent.meta?.pageSeo?.work || {}, loaded.meta?.pageSeo?.work),
      },
    },
    settings: {
      ...mergeSection(defaultContent.settings, loaded.settings),
      availability: mergeSection(
        defaultContent.settings?.availability || { status: 'open', label: 'Available for work' },
        loaded.settings?.availability,
      ),
      socials: loaded.settings?.socials || defaultContent.settings?.socials || [],
    },
    hero: mergeSection(defaultContent.hero, loaded.hero),
    featuredWork: normalizeFeaturedWork(defaultContent.featuredWork, loaded.featuredWork),
    about: mergeSection(defaultContent.about, loaded.about),
    disciplines: {
      ux: mergeSection(defaultContent.disciplines.ux, loaded.disciplines?.ux),
      graphic: mergeSection(defaultContent.disciplines.graphic, loaded.disciplines?.graphic),
    },
    process: {
      ...defaultContent.process,
      ...loaded.process,
      steps: Array.isArray(loaded.process?.steps)
        ? loaded.process.steps.map((step, index) =>
            mergeSection(defaultContent.process.steps[index], step)
          )
        : defaultContent.process.steps,
    },
    contact: mergeSection(
      {
        formEnabled: false,
        showResume: false,
        resumeLabel: 'Download CV',
        resumeUrl: '',
        ...defaultContent.contact,
      },
      loaded.contact,
    ),
    caseStudies: {
      ...defaultContent.caseStudies,
      ...loaded.caseStudies,
    },
  };
}
