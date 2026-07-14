import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroSection from '../components/HeroSection';
import PortfolioSections from '../components/PortfolioSections';
import { useSiteContent } from '../context/SiteContentContext';
import {
  HOME_SECTIONS,
  peekHomeSection,
  saveHomeScrollPosition,
  saveHomeSection,
  shouldSkipHomeIntro,
} from '../utils/visitState';
import { scrollToNavTarget } from '../utils/navScroll';
import { cleanupScrollEffects, scrollToTop } from '../utils/scrollCleanup';

gsap.registerPlugin(ScrollTrigger);

function getRestoreTarget(locationHash) {
  if (locationHash && locationHash !== '#home') {
    return locationHash.replace(/^#/, '');
  }
  const saved = peekHomeSection();
  if (saved && saved !== 'home') return saved;
  return '';
}

export default function HomePage() {
  const location = useLocation();
  const { loading } = useSiteContent();
  const restoredRef = useRef(false);

  useLayoutEffect(() => {
    const hasHash = window.location.hash;
    const restoreSection = peekHomeSection();

    if (!shouldSkipHomeIntro() && !hasHash && (!restoreSection || restoreSection === 'home')) {
      scrollToTop();
    }

    return () => {
      cleanupScrollEffects();
    };
  }, []);

  useEffect(() => {
    if (loading) return undefined;

    const refreshId = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => window.clearTimeout(refreshId);
  }, [loading]);

  // Restore the section you were on after content + scroll animations are ready.
  useEffect(() => {
    if (loading || restoredRef.current) return undefined;
    if (!shouldSkipHomeIntro()) {
      restoredRef.current = true;
      return undefined;
    }

    const targetId = getRestoreTarget(location.hash);
    if (!targetId) {
      restoredRef.current = true;
      return undefined;
    }

    let cancelled = false;
    let attempts = 0;

    const restore = () => {
      if (cancelled) return;
      const el = document.getElementById(targetId);
      if (!el) {
        attempts += 1;
        if (attempts < 16) {
          window.setTimeout(restore, 100);
        } else {
          restoredRef.current = true;
        }
        return;
      }

      scrollToNavTarget(`#${targetId}`, undefined, { immediate: true });
      saveHomeSection(targetId);

      window.setTimeout(() => {
        if (cancelled) return;
        scrollToNavTarget(`#${targetId}`, undefined, { immediate: true });
        ScrollTrigger.refresh();
        window.requestAnimationFrame(() => {
          if (cancelled) return;
          scrollToNavTarget(`#${targetId}`, undefined, { immediate: true });
          restoredRef.current = true;
        });
      }, 220);
    };

    const startId = window.setTimeout(restore, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(startId);
    };
  }, [loading, location.hash]);

  // Track which section is on screen so reload can return there.
  // Start after restore so we don't overwrite the saved section with "home".
  useEffect(() => {
    if (loading) return undefined;

    const needsRestore = shouldSkipHomeIntro() && Boolean(getRestoreTarget(location.hash));
    let cancelled = false;
    let observer;

    const startTracking = () => {
      if (cancelled) return;

      const elements = HOME_SECTIONS
        .map((id) => document.getElementById(id))
        .filter(Boolean);

      if (!elements.length) return;

      const ratios = new Array(elements.length).fill(0);
      let lastId = '';

      observer = new IntersectionObserver(
        (entries) => {
          if (!restoredRef.current && needsRestore) return;

          entries.forEach((entry) => {
            const index = elements.indexOf(entry.target);
            if (index === -1) return;
            ratios[index] = entry.isIntersecting ? entry.intersectionRatio : 0;
          });

          let bestIndex = 0;
          for (let i = 1; i < ratios.length; i += 1) {
            if (ratios[i] > ratios[bestIndex]) bestIndex = i;
          }

          if (ratios[bestIndex] <= 0) return;

          const nextId = elements[bestIndex].id;
          if (nextId === lastId) return;
          lastId = nextId;

          saveHomeSection(nextId);
          saveHomeScrollPosition(window.scrollY || document.documentElement.scrollTop || 0);

          const nextHash = nextId === 'home' ? window.location.pathname : `#${nextId}`;
          const current = window.location.hash.replace(/^#/, '') || 'home';
          if (current === nextId) return;
          window.history.replaceState(null, '', nextHash);
        },
        {
          threshold: [0, 0.2, 0.4, 0.6, 0.8],
          rootMargin: '-25% 0px -45% 0px',
        },
      );

      elements.forEach((el) => observer.observe(el));
    };

    const trackId = window.setTimeout(startTracking, needsRestore ? 900 : 200);

    return () => {
      cancelled = true;
      window.clearTimeout(trackId);
      observer?.disconnect();
    };
  }, [loading, location.hash]);

  useEffect(() => {
    let timerId = 0;

    const persist = () => {
      saveHomeScrollPosition(window.scrollY || document.documentElement.scrollTop || 0);
    };

    const onScroll = () => {
      window.clearTimeout(timerId);
      timerId = window.setTimeout(persist, 80);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', persist);
    window.addEventListener('beforeunload', persist);

    return () => {
      window.clearTimeout(timerId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', persist);
      window.removeEventListener('beforeunload', persist);
      persist();
    };
  }, []);

  return (
    <>
      <HeroSection />
      <PortfolioSections />
    </>
  );
}
