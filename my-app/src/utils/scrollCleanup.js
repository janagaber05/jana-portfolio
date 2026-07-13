import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Revert GSAP pin/transform changes before React unmounts on route change. */
export function cleanupScrollEffects() {
  ScrollTrigger.getAll().forEach((trigger) => {
    trigger.kill(true);
  });

  ScrollTrigger.scrollerProxy(document.documentElement, {
    scrollTop(value) {
      if (arguments.length) {
        window.scrollTo(0, value);
      }
      return window.scrollY || document.documentElement.scrollTop;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
  });

  if (typeof ScrollTrigger.clearScrollMemory === 'function') {
    ScrollTrigger.clearScrollMemory();
  }

  gsap.killTweensOf([document.body, document.documentElement]);
  gsap.set([document.body, document.documentElement], { clearProps: 'backgroundColor' });
  document.body.style.overflow = '';
}

export function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}
