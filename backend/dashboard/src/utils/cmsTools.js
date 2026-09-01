export function exportContentJson(content, filename = 'jana-portfolio-export.json') {
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function isBrokenUrl(value) {
  if (!value || typeof value !== 'string') return false;
  if (value.startsWith('#') || value.startsWith('mailto:') || value.startsWith('tel:')) return false;
  if (value.startsWith('/')) return false;
  if (!/^https?:\/\//i.test(value)) return false;
  return true;
}

function walkStrings(value, onString, path = '') {
  if (typeof value === 'string') {
    onString(value, path);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkStrings(item, onString, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => {
      walkStrings(item, onString, path ? `${path}.${key}` : key);
    });
  }
}

export function findBrokenLinks(content) {
  const links = [];
  walkStrings(content, (value, path) => {
    if (isBrokenUrl(value)) {
      links.push({ path, url: value });
    }
  });
  return links;
}

export function duplicateProject(project, projects) {
  const baseSlug = `${project.slug}-copy`;
  let slug = baseSlug;
  let counter = 2;
  while (projects.some((item) => item.slug === slug)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return {
    ...structuredClone(project),
    id: `work-${Date.now()}`,
    slug,
    title: `${project.title} (copy)`,
    published: false,
    publishAt: null,
  };
}
