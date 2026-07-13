export const EMPTY_PROJECT = {
  id: '',
  slug: '',
  index: '',
  title: 'New Project',
  tag: 'UX / UI',
  accent: '#6D0101',
  year: '2026',
  role: 'Designer',
  client: 'Client',
  summary: '',
  challenge: '',
  outcome: '',
  tools: [],
};

export function findProjectIndex(projects, slug) {
  return projects.findIndex((project) => project.slug === slug);
}

export function createProject(projects) {
  const n = projects.length + 1;
  const pad = String(n).padStart(2, '0');
  return {
    ...EMPTY_PROJECT,
    id: `work-${n}`,
    slug: `project-${n}`,
    index: pad,
  };
}
