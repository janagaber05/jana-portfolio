import { clearHomeScrollRestore, saveHomeScrollPosition, saveHomeSection } from './visitState';

const NAV_OFFSET = 80;
const KNOWN_SECTIONS = new Set(['home', 'work', 'about', 'contact']);

export function getNavTargetId(href) {
  const raw = (href || '').trim();
  if (!raw || raw === '/' || raw === '#home' || raw === 'home') return 'home';
  if (raw.startsWith('#')) return raw.slice(1);
  if (raw.includes('#')) return raw.split('#').pop();
  return raw;
}

export function scrollToNavTarget(href, lenis, options = {}) {
  const immediate = Boolean(options.immediate);
  const targetId = getNavTargetId(href);

  if (targetId === 'home') {
    clearHomeScrollRestore();
    saveHomeSection('home');
    if (lenis) {
      lenis.scrollTo(0, immediate ? { immediate: true } : { duration: 1.1 });
    } else {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: immediate ? 'auto' : 'smooth',
      });
    }
    window.history.replaceState(null, '', window.location.pathname);
    return;
  }

  const target = document.getElementById(targetId);
  if (!target) return;

  saveHomeSection(targetId);

  if (lenis) {
    lenis.scrollTo(
      target,
      immediate
        ? { offset: -NAV_OFFSET, immediate: true }
        : { offset: -NAV_OFFSET, duration: 1.1 },
    );
  } else {
    const top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    window.scrollTo({
      top,
      left: 0,
      behavior: immediate ? 'auto' : 'smooth',
    });
  }

  window.history.replaceState(null, '', `#${targetId}`);
  saveHomeScrollPosition(window.scrollY || document.documentElement.scrollTop || 0);
}

export function filterNavLinks(links = []) {
  return links.filter((link) => KNOWN_SECTIONS.has(getNavTargetId(link.href)));
}
