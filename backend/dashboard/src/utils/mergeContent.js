import defaultContent from '../data/defaultContent.json';

function normalizeFeaturedWork(defaults, loaded) {
  const merged = { ...defaults, ...loaded };
  const projects = loaded?.projects?.length ? loaded.projects : defaults.projects;
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
    meta: mergeSection(defaultContent.meta, loaded.meta),
    settings: mergeSection(defaultContent.settings, loaded.settings),
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
      steps: {
        discover: mergeSection(defaultContent.process.steps.discover, loaded.process?.steps?.discover),
        define: mergeSection(defaultContent.process.steps.define, loaded.process?.steps?.define),
        design: mergeSection(defaultContent.process.steps.design, loaded.process?.steps?.design),
        deliver: mergeSection(defaultContent.process.steps.deliver, loaded.process?.steps?.deliver),
      },
    },
    contact: mergeSection(defaultContent.contact, loaded.contact),
    caseStudies: {
      ...defaultContent.caseStudies,
      ...loaded.caseStudies,
    },
  };
}
