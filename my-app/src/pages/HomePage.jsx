import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroSection from '../components/HeroSection';
import PortfolioSections from '../components/PortfolioSections';
import { useSiteContent } from '../context/SiteContentContext';
import {
  saveHomeScrollPosition,
  shouldSkipHomeIntro,
} from '../utils/visitState';
import { scrollToNavTarget } from '../utils/navScroll';
import { cleanupScrollEffects, scrollToTop } from '../utils/scrollCleanup';

gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
  const location = useLocation();
  const { loading } = useSiteContent();

  useLayoutEffect(() => {
    const hasHash = window.location.hash;

    if (!shouldSkipHomeIntro() && !hasHash) {
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

  useEffect(() => {
    if (!location.hash) return undefined;

    const timerId = window.setTimeout(() => {
      scrollToNavTarget(location.hash);
      ScrollTrigger.refresh();
    }, shouldSkipHomeIntro() ? 120 : 400);

    return () => window.clearTimeout(timerId);
  }, [location]);

  // Keep scroll position so a browser reload stays where you were.
  useEffect(() => {
    let timerId = 0;

    const persist = () => {
      saveHomeScrollPosition(window.scrollY || document.documentElement.scrollTop || 0);
    };

    const onScroll = () => {
      window.clearTimeout(timerId);
      timerId = window.setTimeout(persist, 120);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', persist);

    return () => {
      window.clearTimeout(timerId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', persist);
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
