import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function useScrollAnimations(enabled = true) {
  const initRef = useRef(false);

  useEffect(() => {
    if (!enabled || initRef.current) return undefined;
    initRef.current = true;

    const ctx = gsap.context(() => {
      gsap.utils.toArray('.fade-section').forEach((el) => {
        if (el.id === 'about') return;

        gsap.from(el, {
          opacity: 0,
          y: 60,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
          },
        });
      });
    });

    const refreshId = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      window.clearTimeout(refreshId);
      initRef.current = false;
      ctx.revert();
    };
  }, [enabled]);
}
