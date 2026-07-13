import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroSection from '../components/HeroSection';
import PortfolioSections from '../components/PortfolioSections';
import { useSiteContent } from '../context/SiteContentContext';
import { shouldSkipHomeIntro } from '../utils/visitState';
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

  return (
    <>
      <HeroSection />
      <PortfolioSections />
    </>
  );
}
