import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Revert GSAP pin/transform changes before React unmounts on route change. */
export function cleanupScrollEffects() {
  ScrollTrigger.getAll().forEach((trigger) => {
    trigger.kill(true);
  });

  if (typeof ScrollTrigger.clearScrollMemory === 'function') {
    ScrollTrigger.clearScrollMemory();
  }

  if (typeof ScrollTrigger.refresh === 'function') {
    ScrollTrigger.refresh();
  }

  gsap.killTweensOf([document.body, document.documentElement]);
  gsap.set([document.body, document.documentElement], { clearProps: 'backgroundColor,transform' });
  document.body.style.overflow = '';
  document.documentElement.classList.remove('fx-scroll-lock');
  document.documentElement.style.overflow = '';
}

export function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}
