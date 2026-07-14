import { clearHomeScrollRestore, saveHomeScrollPosition } from './visitState';

const NAV_OFFSET = 80;
const KNOWN_SECTIONS = new Set(['home', 'work', 'about', 'contact']);

export function getNavTargetId(href) {
  const raw = (href || '').trim();
  if (!raw || raw === '/' || raw === '#home' || raw === 'home') return 'home';
  if (raw.startsWith('#')) return raw.slice(1);
  if (raw.includes('#')) return raw.split('#').pop();
  return raw;
}

export function scrollToNavTarget(href, lenis) {
  const targetId = getNavTargetId(href);

  if (targetId === 'home') {
    clearHomeScrollRestore();
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.1 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.history.replaceState(null, '', window.location.pathname);
    return;
  }

  const target = document.getElementById(targetId);
  if (!target) return;

  if (lenis) {
    lenis.scrollTo(target, { offset: -NAV_OFFSET, duration: 1.1 });
  } else {
    const top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  window.history.replaceState(null, '', `#${targetId}`);

  // Approximate save for hash targets so reload can recover mid-page.
  window.setTimeout(() => {
    saveHomeScrollPosition(window.scrollY || document.documentElement.scrollTop || 0);
  }, 1200);
}

export function filterNavLinks(links = []) {
  return links.filter((link) => KNOWN_SECTIONS.has(getNavTargetId(link.href)));
}
