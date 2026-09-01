import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteContent } from '../context/SiteContentContext';
import { resolveMediaUrl } from '../utils/mediaUrl';

function upsertMeta(name, content) {
  if (!content) return;
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function upsertProperty(property, content) {
  if (!content) return;
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export default function SeoHead() {
  const { content } = useSiteContent();
  const location = useLocation();

  useEffect(() => {
    if (!content) return;

    const meta = content.meta || {};
    const seo = meta.seo || {};
    const pageSeo = meta.pageSeo || {};
    const path = location.pathname;

    let page = pageSeo.home || {};
    let title = page.title || meta.siteTitle || 'Jana — Portfolio';
    let description = page.description || seo.description || 'UX/UI designer portfolio.';
    let ogImage = page.ogImage || seo.ogImage || '';

    if (path.startsWith('/work/') && path !== '/work') {
      const slug = path.split('/').pop();
      const project = content.featuredWork?.projects?.find((item) => item.slug === slug);
      const projectSeo = project?.seo || {};
      title = projectSeo.title || `${project?.title || 'Project'} — ${meta.siteTitle || 'Jana'}`;
      description = projectSeo.description || project?.summary || description;
      ogImage = projectSeo.ogImage || project?.thumbnail || ogImage;
    } else if (path === '/work') {
      page = pageSeo.work || {};
      title = page.title || `Work — ${meta.siteTitle || 'Jana'}`;
      description = page.description || description;
      ogImage = page.ogImage || ogImage;
    }

    document.title = title;
    upsertMeta('description', description);
    upsertProperty('og:title', title);
    upsertProperty('og:description', description);
    if (ogImage) upsertProperty('og:image', resolveMediaUrl(ogImage));

    const favicon = content.settings?.favicon;
    if (favicon) {
      let link = document.querySelector('link[rel="icon"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = resolveMediaUrl(favicon);
    }
  }, [content, location.pathname]);

  return null;
}
